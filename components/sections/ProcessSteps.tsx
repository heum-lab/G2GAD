type ProcessStepsProps = {
  steps: readonly { step: string; desc: string }[];
};

/** 진행 단계 목록. 메인(H-07)과 서비스 상세의 "진행 방식"에서 쓴다. */
export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <ol className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
      {steps.map((item, index) => (
        <li
          key={item.step}
          className="rounded-card border-border bg-background border p-5"
        >
          <span className="text-primary text-sm font-bold">STEP {index + 1}</span>
          <p className="mt-2 text-lg font-bold">{item.step}</p>
          <p className="text-muted-foreground mt-1.5 leading-7">{item.desc}</p>
        </li>
      ))}
    </ol>
  );
}
