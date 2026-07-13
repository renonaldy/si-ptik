import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GraduationCap } from "lucide-react";

import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total Dosen" value={42} icon={GraduationCap} />);
    expect(screen.getByText("Total Dosen")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows a skeleton instead of value while loading", () => {
    render(<StatCard label="Total" value={1} icon={GraduationCap} loading />);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
