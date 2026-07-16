package obe

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

// ClassResults computes (and persists) the full achievement tree for one class:
//
//	score → CPMK:  Σ(score/100 × bobot) / Σ(bobot) × 100 over the assessments
//	               mapped to the CPMK (missing scores count 0 in the numerator
//	               but keep their bobot in the denominator)
//	CPMK  → CPL:   mean of the student's computed CPMKs linked to the CPL
//	CPMK  → IK:    mean of the student's computed CPMKs linked to the IK
//
// Status per CPMK compares against the CPMK's own target (e.g. "80%") when
// parseable, else the curriculum threshold; CPL/IK always use the curriculum
// threshold. Results are recomputed on every read (small data), then stored in
// the obe_*_results tables so they never go stale.
func (s *AssessmentService) ClassResults(ctx context.Context, classID string) (*ClassResults, error) {
	class, err := s.GetClass(ctx, strings.TrimSpace(classID))
	if err != nil {
		return nil, err
	}
	course, err := s.core.GetCourse(ctx, class.CourseID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults course: %w", err)
	}
	if course == nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults: course %s missing", class.CourseID)
	}
	curriculum, err := s.core.GetCurriculum(ctx, course.CurriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults curriculum: %w", err)
	}
	if curriculum == nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults: curriculum %s missing", course.CurriculumID)
	}
	threshold := float64(curriculum.Threshold)
	if threshold <= 0 {
		threshold = 70
	}

	students, err := s.repo.ListStudents(ctx, class.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults students: %w", err)
	}
	assessments, err := s.scopedAssessments(ctx, class)
	if err != nil {
		return nil, err
	}
	aLinks, err := s.repo.ListAssessmentLinksByCourse(ctx, course.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults assessment links: %w", err)
	}
	cpmks, err := s.core.ListCPMKByCourse(ctx, course.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults cpmks: %w", err)
	}
	cpls, err := s.core.ListCPL(ctx, curriculum.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults cpls: %w", err)
	}
	cplLinks, err := s.core.ListLinksByCurriculum(ctx, curriculum.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults cpl links: %w", err)
	}
	iks, err := s.repo.ListIndicators(ctx, curriculum.ID, "")
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults iks: %w", err)
	}
	ikLinks, err := s.repo.ListIKLinksByCurriculum(ctx, curriculum.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults ik links: %w", err)
	}
	scores, err := s.repo.ListScoresByClass(ctx, class.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults scores: %w", err)
	}

	// ── Index everything ──
	assessByID := map[string]Assessment{}
	bobotTotal := 0
	for _, a := range assessments {
		assessByID[a.ID] = a
		bobotTotal += a.Bobot
	}
	// CPMK → its in-scope assessments (via assessment↔CPMK links).
	cpmkAssess := map[string][]Assessment{}
	for _, l := range aLinks {
		if a, ok := assessByID[l.AssessmentID]; ok {
			cpmkAssess[l.CPMKID] = append(cpmkAssess[l.CPMKID], a)
		}
	}
	courseCPMK := map[string]bool{}
	for _, m := range cpmks {
		courseCPMK[m.ID] = true
	}
	// CPL/IK → the course's CPMKs they are linked to.
	cplCpmks := map[string][]string{}
	for _, l := range cplLinks {
		if courseCPMK[l.CPMKID] {
			cplCpmks[l.CPLID] = append(cplCpmks[l.CPLID], l.CPMKID)
		}
	}
	ikCpmks := map[string][]string{}
	for _, l := range ikLinks {
		if courseCPMK[l.CPMKID] {
			ikCpmks[l.IKID] = append(ikCpmks[l.IKID], l.CPMKID)
		}
	}
	// Only CPLs/IKs that this course actually evidences appear in the payload.
	usedCPLs := []CPL{}
	for _, c := range cpls {
		if len(cplCpmks[c.ID]) > 0 {
			usedCPLs = append(usedCPLs, c)
		}
	}
	usedIKs := []Indicator{}
	for _, ik := range iks {
		if len(ikCpmks[ik.ID]) > 0 {
			usedIKs = append(usedIKs, ik)
		}
	}
	// student → assessment → score
	scoreOf := map[string]map[string]float64{}
	for _, sc := range scores {
		if scoreOf[sc.StudentID] == nil {
			scoreOf[sc.StudentID] = map[string]float64{}
		}
		scoreOf[sc.StudentID][sc.AssessmentID] = sc.Score
	}
	// Per-CPMK threshold: its own target when parseable, else the curriculum's.
	cpmkThreshold := map[string]float64{}
	for _, m := range cpmks {
		cpmkThreshold[m.ID] = parseTargetPercent(m.Target, threshold)
	}

	// ── Compute per student ──
	studentIDs := make([]string, 0, len(students))
	perStudent := make([]StudentResults, 0, len(students))
	var storeCPMK, storeCPL, storeIK []StoredResult
	type agg struct {
		sum      float64
		tercapai int
		dinilai  int
	}
	aggCPMK := map[string]*agg{}
	aggCPL := map[string]*agg{}
	aggIK := map[string]*agg{}
	addAgg := func(m map[string]*agg, refID string, val float64, ok bool) {
		a := m[refID]
		if a == nil {
			a = &agg{}
			m[refID] = a
		}
		a.sum += val
		a.dinilai++
		if ok {
			a.tercapai++
		}
	}

	for _, st := range students {
		studentIDs = append(studentIDs, st.ID)
		myScores := scoreOf[st.ID]
		res := StudentResults{Student: st, CPMK: []ResultRow{}, CPL: []ResultRow{}, IK: []ResultRow{}}
		cpmkVal := map[string]float64{}

		for _, m := range cpmks {
			as := cpmkAssess[m.ID]
			if len(as) == 0 {
				continue
			}
			num, den, hasScore := 0.0, 0.0, false
			for _, a := range as {
				den += float64(a.Bobot)
				if sc, ok := myScores[a.ID]; ok {
					num += sc / 100 * float64(a.Bobot)
					hasScore = true
				}
			}
			if !hasScore || den == 0 {
				continue // no evidence at all → no result row for this CPMK
			}
			val := round2(num / den * 100)
			cpmkVal[m.ID] = val
			ok := val >= cpmkThreshold[m.ID]
			res.CPMK = append(res.CPMK, ResultRow{RefID: m.ID, Nilai: val, Status: statusOf(ok)})
			addAgg(aggCPMK, m.ID, val, ok)
			storeCPMK = append(storeCPMK, StoredResult{
				ID: "obecr-" + uuid.NewString(), StudentID: st.ID, RefID: m.ID, Nilai: val, Status: statusOf(ok),
			})
		}

		derive := func(refCpmks []string) (float64, bool) {
			sum, n := 0.0, 0
			for _, id := range refCpmks {
				if v, ok := cpmkVal[id]; ok {
					sum += v
					n++
				}
			}
			if n == 0 {
				return 0, false
			}
			return round2(sum / float64(n)), true
		}
		for _, c := range usedCPLs {
			if val, has := derive(cplCpmks[c.ID]); has {
				ok := val >= threshold
				res.CPL = append(res.CPL, ResultRow{RefID: c.ID, Nilai: val, Status: statusOf(ok)})
				addAgg(aggCPL, c.ID, val, ok)
				storeCPL = append(storeCPL, StoredResult{
					ID: "obeplr-" + uuid.NewString(), StudentID: st.ID, RefID: c.ID, Nilai: val, Status: statusOf(ok),
				})
			}
		}
		for _, ik := range usedIKs {
			if val, has := derive(ikCpmks[ik.ID]); has {
				ok := val >= threshold
				res.IK = append(res.IK, ResultRow{RefID: ik.ID, Nilai: val, Status: statusOf(ok)})
				addAgg(aggIK, ik.ID, val, ok)
				storeIK = append(storeIK, StoredResult{
					ID: "obeikr-" + uuid.NewString(), StudentID: st.ID, RefID: ik.ID, Nilai: val, Status: statusOf(ok),
				})
			}
		}
		perStudent = append(perStudent, res)
	}

	// ── Class-level aggregates (mean over assessed students) ──
	collect := func(m map[string]*agg, order []string) []AggRow {
		rows := []AggRow{}
		for _, refID := range order {
			a := m[refID]
			if a == nil || a.dinilai == 0 {
				continue
			}
			rows = append(rows, AggRow{
				RefID: refID, Nilai: round2(a.sum / float64(a.dinilai)),
				Tercapai: a.tercapai, Dinilai: a.dinilai,
			})
		}
		return rows
	}
	cpmkOrder := make([]string, len(cpmks))
	for i, m := range cpmks {
		cpmkOrder[i] = m.ID
	}
	cplOrder := make([]string, len(usedCPLs))
	for i, c := range usedCPLs {
		cplOrder[i] = c.ID
	}
	ikOrder := make([]string, len(usedIKs))
	for i, ik := range usedIKs {
		ikOrder[i] = ik.ID
	}

	// ── Persist (wipe + insert per student, serialized per class) ──
	if err := s.repo.ReplaceResults(ctx, class.ID, studentIDs, storeCPMK, storeCPL, storeIK); err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ClassResults persist: %w", err)
	}

	return &ClassResults{
		Class:      class,
		Course:     course,
		Threshold:  int(threshold),
		BobotTotal: bobotTotal,
		CPMKs:      cpmks,
		CPLs:       usedCPLs,
		IKs:        usedIKs,
		Students:   perStudent,
		ClassCPMK:  collect(aggCPMK, cpmkOrder),
		ClassCPL:   collect(aggCPL, cplOrder),
		ClassIK:    collect(aggIK, ikOrder),
	}, nil
}

// scopedAssessments returns the course's assessments that apply to a class:
// tahun akademik must match when both sides set one (blank matches everything,
// so pre-existing data keeps working).
func (s *AssessmentService) scopedAssessments(ctx context.Context, class *Class) ([]Assessment, error) {
	all, err := s.repo.ListAssessments(ctx, class.CourseID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.scopedAssessments: %w", err)
	}
	scoped := []Assessment{}
	for _, a := range all {
		if a.TahunAkademik == "" || class.TahunAkademik == "" || a.TahunAkademik == class.TahunAkademik {
			scoped = append(scoped, a)
		}
	}
	return scoped, nil
}

// parseTargetPercent turns a CPMK target like "80%", "80", or "75.5 %" into a
// number; anything unparseable (or out of range) falls back to def.
func parseTargetPercent(target string, def float64) float64 {
	tr := strings.TrimSpace(strings.TrimSuffix(strings.TrimSpace(target), "%"))
	if tr == "" {
		return def
	}
	v, err := strconv.ParseFloat(tr, 64)
	if err != nil || v <= 0 || v > 100 {
		return def
	}
	return v
}

func statusOf(tercapai bool) string {
	if tercapai {
		return StatusTercapai
	}
	return StatusBelumTercapai
}

// round2 rounds half-up to 2 decimals. The tiny epsilon counters binary
// representation error (e.g. 76.165 stored as 76.16499…) so grade-style
// half-up rounding behaves conventionally; values here are always ≥ 0.
func round2(v float64) float64 { return math.Round(v*100+1e-9) / 100 }
