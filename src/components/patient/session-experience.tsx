"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSessionAction } from "@/app/actions";
import {
  ArrowRightIcon,
  CheckIcon,
  PlayIcon,
  TargetIcon,
  TraceIcon,
} from "@/components/icons";
import {
  calculateTargetSummary,
  calculateTracingSummary,
  clamp,
  distanceBetween,
  distanceToReferencePath,
  normalizePointer,
  TARGET_POSITIONS,
  TRACE_REFERENCE_POINTS,
  TRACE_VIEWBOX,
  type Point,
} from "@/lib/metrics";
import type {
  ExerciseResult,
  PointerKind,
  RecordedInputEvent,
  SessionSubmission,
} from "@/lib/types";

type Stage =
  | "setup"
  | "target"
  | "target-complete"
  | "trace"
  | "trace-complete"
  | "saving"
  | "error";

type DemoState = {
  type: "target" | "trace";
  next: "setup" | "target" | "trace";
} | null;

const tracePath = "M 90 300 C 230 60 470 340 710 100";

function getPointerKind(pointerType: string): PointerKind {
  if (pointerType === "mouse" || pointerType === "pen" || pointerType === "touch") {
    return pointerType;
  }
  return "unknown";
}

function getPressure(event: React.PointerEvent) {
  return event.pointerType === "pen" || event.pointerType === "touch"
    ? event.pressure
    : null;
}

function SessionProgress({ stage }: { stage: Stage }) {
  const step =
    stage === "setup"
      ? 0
      : stage === "target" || stage === "target-complete"
        ? 1
        : 2;

  return (
    <div className="mb-5 flex items-center gap-3" aria-label={`Session step ${step} of 2`}>
      {[1, 2].map((number) => (
        <div key={number} className="flex flex-1 items-center gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
              step >= number
                ? "bg-[var(--teal)] text-white"
                : "border-2 border-[var(--line)] bg-white text-[var(--muted)]"
            }`}
          >
            {step > number ? <CheckIcon className="size-5" /> : number}
          </span>
          <span className="hidden text-sm font-bold sm:inline">
            {number === 1 ? "Target Touch" : "Path Tracing"}
          </span>
          {number === 1 ? (
            <span className="h-1 flex-1 rounded-full bg-[var(--line)]">
              <span
                className={`block h-full rounded-full bg-[var(--teal)] ${step >= 2 ? "w-full" : "w-0"}`}
              />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function WatchHowDialog({
  demo,
  onContinue,
  onClose,
}: {
  demo: NonNullable<DemoState>;
  onContinue: () => void;
  onClose: () => void;
}) {
  const isTarget = demo.type === "target";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d31]/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-how-title"
    >
      <div className="surface w-full max-w-xl p-6 sm:p-8">
        <p className="eyebrow">Interaction preview</p>
        <h2 id="watch-how-title" className="mt-2 text-3xl font-black">
          {isTarget ? "Touch the center of each target" : "Follow the path to the finish"}
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[#eff8f6] p-6">
          {isTarget ? (
            <div className="relative mx-auto h-44 max-w-sm">
              <span className="absolute right-12 top-7 size-20 rounded-full border-[12px] border-[var(--coral)] bg-white" />
              <span className="demo-pointer absolute bottom-8 left-12 flex size-14 items-center justify-center rounded-full bg-[var(--teal)] text-2xl text-white shadow-xl">
                ●
              </span>
            </div>
          ) : (
            <svg
              viewBox="0 0 800 400"
              className="mx-auto h-44 w-full"
              role="img"
              aria-label="Curved path from a green start circle to a coral finish circle"
            >
              <path d={tracePath} fill="none" stroke="#b7d8d4" strokeWidth="74" strokeLinecap="round" />
              <path d={tracePath} fill="none" stroke="#12606b" strokeWidth="5" strokeDasharray="11 12" strokeLinecap="round" />
              <circle cx="90" cy="300" r="25" fill="#1f7a55" />
              <circle cx="710" cy="100" r="25" fill="#ed775e" />
            </svg>
          )}
        </div>
        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          {isTarget
            ? "A new target appears after each successful touch. Touches outside the target are recorded as misses."
            : "Begin inside the green circle, stay near the center line, and finish inside the coral circle."}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="button-quiet">
            Back
          </button>
          <button type="button" onClick={onContinue} className="button-primary tablet-button">
            {demo.next === "setup"
              ? "Back to session setup"
              : isTarget
                ? "Begin Target Touch"
                : "Begin Path Tracing"}
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SessionExperience({ participantId }: { participantId: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("setup");
  const [showDemonstrations, setShowDemonstrations] = useState(true);
  const [targetSize, setTargetSize] = useState<"large" | "standard">("large");
  const [repetitions, setRepetitions] = useState<6 | 8>(6);
  const [pathWidth, setPathWidth] = useState<"wide" | "standard">("wide");
  const [demo, setDemo] = useState<DemoState>(null);
  const [targetIndex, setTargetIndex] = useState(0);
  const [targetAttempts, setTargetAttempts] = useState(0);
  const [targetFeedback, setTargetFeedback] = useState("Touch the target when it appears.");
  const [traceFeedback, setTraceFeedback] = useState("Place your finger or stylus in the green start circle.");
  const [tracePoints, setTracePoints] = useState<Point[]>([]);
  const [traceAttempts, setTraceAttempts] = useState(0);
  const [targetResult, setTargetResult] = useState<ExerciseResult | null>(null);
  const [traceResult, setTraceResult] = useState<ExerciseResult | null>(null);
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  const boardRef = useRef<HTMLDivElement>(null);
  const sessionStartedAtRef = useRef("");
  const sessionStartedMsRef = useRef(0);
  const targetStartedAtRef = useRef("");
  const targetStartedMsRef = useRef(0);
  const targetShownAtRef = useRef(0);
  const targetEventsRef = useRef<RecordedInputEvent[]>([]);
  const targetResponsesRef = useRef<number[]>([]);
  const traceStartedAtRef = useRef("");
  const traceStartedMsRef = useRef(0);
  const traceEventsRef = useRef<RecordedInputEvent[]>([]);
  const activeTracePointsRef = useRef<Point[]>([]);
  const traceAttemptsRef = useRef(0);
  const tracingRef = useRef(false);

  const targetDiameter = targetSize === "large" ? 108 : 84;
  const allowedPathDistance = pathWidth === "wide" ? 38 : 27;
  const visiblePathWidth = allowedPathDistance * 2;

  function beginTarget() {
    const now = new Date();
    targetStartedAtRef.current = now.toISOString();
    targetStartedMsRef.current = performance.now();
    targetShownAtRef.current = performance.now();
    targetEventsRef.current = [];
    targetResponsesRef.current = [];
    setTargetIndex(0);
    setTargetAttempts(0);
    setTargetFeedback("Touch the target when it appears.");
    setStage("target");
  }

  function beginTrace() {
    const now = new Date();
    traceStartedAtRef.current = now.toISOString();
    traceStartedMsRef.current = performance.now();
    traceEventsRef.current = [];
    activeTracePointsRef.current = [];
    traceAttemptsRef.current = 0;
    setTraceAttempts(0);
    tracingRef.current = false;
    setTracePoints([]);
    setTraceFeedback("Place your finger or stylus in the green start circle.");
    setStage("trace");
  }

  function startSession() {
    const now = new Date();
    sessionStartedAtRef.current = now.toISOString();
    sessionStartedMsRef.current = performance.now();
    if (showDemonstrations) {
      setDemo({ type: "target", next: "target" });
    } else {
      beginTarget();
    }
  }

  function continueFromDemo() {
    const next = demo?.next;
    setDemo(null);
    if (next === "setup") return;
    if (next === "target") beginTarget();
    if (next === "trace") beginTrace();
  }

  function openTrace() {
    if (showDemonstrations) {
      setDemo({ type: "trace", next: "trace" });
    } else {
      beginTrace();
    }
  }

  function targetEvent(
    event: React.PointerEvent,
    outcome: "hit" | "miss",
  ): RecordedInputEvent | null {
    const board = boardRef.current;
    if (!board) return null;
    const normalized = normalizePointer(
      event.clientX,
      event.clientY,
      board.getBoundingClientRect(),
    );
    return {
      sequenceNumber: targetEventsRef.current.length + 1,
      eventType: "pointerdown",
      pointerType: getPointerKind(event.pointerType),
      xNormalized: normalized.x,
      yNormalized: normalized.y,
      elapsedMs: Math.round(performance.now() - targetStartedMsRef.current),
      pressure: getPressure(event),
      outcome,
    };
  }

  function handleTargetMiss(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const recorded = targetEvent(event, "miss");
    if (!recorded) return;
    targetEventsRef.current.push(recorded);
    setTargetAttempts(targetEventsRef.current.length);
    setTargetFeedback("Not quite—try the center of the target.");
  }

  function handleTargetHit(event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const recorded = targetEvent(event, "hit");
    if (!recorded) return;

    const now = performance.now();
    targetEventsRef.current.push(recorded);
    targetResponsesRef.current.push(Math.round(now - targetShownAtRef.current));
    setTargetAttempts(targetEventsRef.current.length);

    const completedTargets = targetIndex + 1;
    if (completedTargets >= repetitions) {
      const completedAt = new Date().toISOString();
      const summary = calculateTargetSummary(
        targetEventsRef.current,
        targetResponsesRef.current,
      );
      setTargetResult({
        exerciseSlug: "target-touch",
        sequenceNumber: 1,
        startedAt: targetStartedAtRef.current,
        completedAt,
        status: "completed",
        configuration: { targetSize, repetitions },
        durationMs: Math.round(now - targetStartedMsRef.current),
        ...summary,
        meanPathDeviation: null,
        onPathPercent: null,
        inputEvents: targetEventsRef.current,
      });
      setTargetIndex(completedTargets);
      setTargetFeedback("Target Touch complete.");
      setStage("target-complete");
      return;
    }

    setTargetIndex(completedTargets);
    setTargetFeedback("Correct. Here is the next target.");
    targetShownAtRef.current = now;
  }

  function tracePointFromEvent(event: React.PointerEvent<SVGSVGElement>) {
    const screenMatrix = event.currentTarget.getScreenCTM();
    if (screenMatrix) {
      const svgPoint = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        screenMatrix.inverse(),
      );
      const point = {
        x: clamp(svgPoint.x, 0, TRACE_VIEWBOX.width),
        y: clamp(svgPoint.y, 0, TRACE_VIEWBOX.height),
      };
      return {
        point,
        normalized: {
          x: point.x / TRACE_VIEWBOX.width,
          y: point.y / TRACE_VIEWBOX.height,
        },
      };
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const normalized = normalizePointer(event.clientX, event.clientY, bounds);
    return {
      point: {
        x: normalized.x * TRACE_VIEWBOX.width,
        y: normalized.y * TRACE_VIEWBOX.height,
      },
      normalized,
    };
  }

  function appendTraceEvent(
    event: React.PointerEvent<SVGSVGElement>,
    eventType: RecordedInputEvent["eventType"],
    outcome: RecordedInputEvent["outcome"],
    normalized: { x: number; y: number },
  ) {
    traceEventsRef.current.push({
      sequenceNumber: traceEventsRef.current.length + 1,
      eventType,
      pointerType: getPointerKind(event.pointerType),
      xNormalized: normalized.x,
      yNormalized: normalized.y,
      elapsedMs: Math.round(performance.now() - traceStartedMsRef.current),
      pressure: getPressure(event),
      outcome,
    });
  }

  function handleTraceStart(event: React.PointerEvent<SVGSVGElement>) {
    event.preventDefault();
    const { point, normalized } = tracePointFromEvent(event);
    const startPoint = TRACE_REFERENCE_POINTS[0];

    if (distanceBetween(point, startPoint) > 58) {
      setTraceFeedback("Start inside the green circle.");
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    tracingRef.current = true;
    traceAttemptsRef.current += 1;
    setTraceAttempts(traceAttemptsRef.current);
    activeTracePointsRef.current = [point];
    setTracePoints([point]);
    appendTraceEvent(event, "pointerdown", "start", normalized);
    setTraceFeedback("Keep following the center of the path.");
  }

  function handleTraceMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!tracingRef.current) return;
    event.preventDefault();
    const { point, normalized } = tracePointFromEvent(event);
    const previous = activeTracePointsRef.current.at(-1);
    if (previous && distanceBetween(previous, point) < 3) return;

    const onTrack = distanceToReferencePath(point) <= allowedPathDistance;
    activeTracePointsRef.current = [...activeTracePointsRef.current, point];
    setTracePoints(activeTracePointsRef.current);
    appendTraceEvent(
      event,
      "pointermove",
      onTrack ? "on-track" : "off-track",
      normalized,
    );
    setTraceFeedback(onTrack ? "On track" : "Move back toward the center line");
  }

  function handleTraceEnd(event: React.PointerEvent<SVGSVGElement>) {
    if (!tracingRef.current) return;
    event.preventDefault();
    tracingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const { point, normalized } = tracePointFromEvent(event);
    const endPoint = TRACE_REFERENCE_POINTS.at(-1) ?? { x: 710, y: 100 };
    const reachedFinish =
      distanceBetween(point, endPoint) <= 62 &&
      activeTracePointsRef.current.length >= 8;
    appendTraceEvent(
      event,
      "pointerup",
      reachedFinish ? "finish" : "off-track",
      normalized,
    );

    if (!reachedFinish) {
      activeTracePointsRef.current = [];
      setTracePoints([]);
      setTraceFeedback("The path ended early. Return to the green circle and try again.");
      return;
    }

    const now = performance.now();
    const completedAt = new Date().toISOString();
    const traceSummary = calculateTracingSummary(
      activeTracePointsRef.current,
      allowedPathDistance,
    );
    setTraceResult({
      exerciseSlug: "path-tracing",
      sequenceNumber: 2,
      startedAt: traceStartedAtRef.current,
      completedAt,
      status: "completed",
      configuration: { pathWidth },
      durationMs: Math.round(now - traceStartedMsRef.current),
      totalAttempts: traceAttemptsRef.current,
      successfulActions: 1,
      accuracyPercent: null,
      meanResponseMs: null,
      ...traceSummary,
      inputEvents: traceEventsRef.current,
    });
    setTraceFeedback("Path Tracing complete.");
    setStage("trace-complete");
  }

  function saveCompletedSession() {
    if (!targetResult || !traceResult) return;
    setStage("saving");
    setSaveError("");

    startTransition(async () => {
      try {
        const completedAt = new Date().toISOString();
        const submission: SessionSubmission = {
          participantId,
          startedAt: sessionStartedAtRef.current,
          completedAt,
          totalDurationMs: Math.round(
            performance.now() - sessionStartedMsRef.current,
          ),
          exercises: [targetResult, traceResult],
        };
        const result = await saveSessionAction(submission);
        localStorage.setItem(
          "hands:last-session:v1",
          JSON.stringify({
            sessionId: result.sessionId,
            completedAt,
            storageMode: result.storageMode,
            totalDurationMs: submission.totalDurationMs,
            targetAccuracy: targetResult.accuracyPercent,
            targetAttempts: targetResult.totalAttempts,
            successfulTargets: targetResult.successfulActions,
            meanResponseMs: targetResult.meanResponseMs,
            pathDeviation: traceResult.meanPathDeviation,
            onPathPercent: traceResult.onPathPercent,
            traceAttempts: traceResult.totalAttempts,
          }),
        );
        router.push(`/patient/complete?session=${result.sessionId}`);
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "The session could not be saved.",
        );
        setStage("error");
      }
    });
  }

  if (stage === "setup") {
    return (
      <>
        <div className="mb-5">
          <SessionProgress stage={stage} />
        </div>
        <section className="surface p-6 sm:p-9">
          <p className="eyebrow">Today&apos;s session</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
            Ready when you are
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Complete Target Touch, then follow one curved path. You can preview
            each interaction before beginning.
          </p>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <fieldset className="rounded-2xl border border-[var(--line)] p-5">
              <legend className="px-2 text-lg font-extrabold">Target Touch settings</legend>
              <div className="mt-3">
                <p className="text-sm font-bold text-[var(--muted)]">Target size</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(["large", "standard"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={targetSize === size}
                      onClick={() => setTargetSize(size)}
                      className={`min-h-14 rounded-xl border-2 px-4 font-bold capitalize ${
                        targetSize === size
                          ? "border-[var(--teal)] bg-[var(--teal-pale)] text-[var(--teal-dark)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-[var(--muted)]">Repetitions</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {([6, 8] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={repetitions === count}
                      onClick={() => setRepetitions(count)}
                      className={`min-h-14 rounded-xl border-2 px-4 font-bold ${
                        repetitions === count
                          ? "border-[var(--teal)] bg-[var(--teal-pale)] text-[var(--teal-dark)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      {count} targets
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-[var(--line)] p-5">
              <legend className="px-2 text-lg font-extrabold">Path Tracing settings</legend>
              <p className="mt-3 text-sm font-bold text-[var(--muted)]">Path width</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["wide", "standard"] as const).map((width) => (
                  <button
                    key={width}
                    type="button"
                    aria-pressed={pathWidth === width}
                    onClick={() => setPathWidth(width)}
                    className={`min-h-14 rounded-xl border-2 px-4 font-bold capitalize ${
                      pathWidth === width
                        ? "border-[var(--coral)] bg-[#fff0eb] text-[var(--coral-dark)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {width}
                  </button>
                ))}
              </div>
              <label className="mt-6 flex min-h-16 cursor-pointer items-center gap-4 rounded-xl bg-[#f4f5f2] px-4 py-3">
                <input
                  type="checkbox"
                  checked={showDemonstrations}
                  onChange={(event) => setShowDemonstrations(event.target.checked)}
                  className="size-6 accent-[var(--teal)]"
                />
                <span>
                  <strong className="block">Show interaction previews</strong>
                  <span className="text-sm text-[var(--muted)]">Can be replayed before each activity</span>
                </span>
              </label>
            </fieldset>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setDemo({ type: "target", next: "setup" })}
              className="button-secondary tablet-button"
            >
              <PlayIcon />
              Watch how
            </button>
            <button type="button" onClick={startSession} className="button-primary tablet-button">
              Begin session
              <ArrowRightIcon />
            </button>
          </div>
        </section>
        {demo ? (
          <WatchHowDialog
            demo={demo}
            onContinue={continueFromDemo}
            onClose={() => setDemo(null)}
          />
        ) : null}
      </>
    );
  }

  if (stage === "target") {
    const position = TARGET_POSITIONS[targetIndex % TARGET_POSITIONS.length];
    return (
      <>
        <SessionProgress stage={stage} />
        <section className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--teal-pale)] text-[var(--teal)]">
                <TargetIcon />
              </span>
              <div>
                <h1 className="text-xl font-extrabold">Target Touch</h1>
                <p className="text-sm text-[var(--muted)]">Touch the center of each coral target.</p>
              </div>
            </div>
            <span className="rounded-full bg-[#f1f3f1] px-4 py-2 text-sm font-bold">
              Target {Math.min(targetIndex + 1, repetitions)} of {repetitions}
            </span>
          </div>

          <div
            ref={boardRef}
            onPointerDown={handleTargetMiss}
            className="target-board relative h-[min(58vh,540px)] min-h-[390px] overflow-hidden bg-[#e8f3f1]"
            aria-label="Target Touch activity area"
          >
            <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#88b4af 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <button
              type="button"
              onPointerDown={handleTargetHit}
              className="target-button absolute rounded-full border-[14px] border-[var(--coral)] bg-white transition-transform active:scale-90"
              style={{
                width: targetDiameter,
                height: targetDiameter,
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              aria-label={`Touch target ${targetIndex + 1} of ${repetitions}`}
            >
              <span className="sr-only">Touch target</span>
            </button>
          </div>

          <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
            <p className="text-lg font-bold" aria-live="polite">{targetFeedback}</p>
            <p className="text-sm font-semibold text-[var(--muted)]">Attempts: {targetAttempts}</p>
          </div>
        </section>
      </>
    );
  }

  if (stage === "target-complete" && targetResult) {
    return (
      <>
        <SessionProgress stage={stage} />
        <section className="surface p-7 text-center sm:p-10">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#dff3e9] text-[var(--success)]">
            <CheckIcon className="size-10" />
          </span>
          <p className="eyebrow mt-6">Activity 1 complete</p>
          <h1 className="mt-2 text-4xl font-black">Target Touch finished</h1>
          <div className="mx-auto mt-7 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f4f5f2] p-5">
              <p className="text-sm text-[var(--muted)]">Successful targets</p>
              <p className="mt-1 text-3xl font-black">{targetResult.successfulActions}</p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f2] p-5">
              <p className="text-sm text-[var(--muted)]">Attempts</p>
              <p className="mt-1 text-3xl font-black">{targetResult.totalAttempts}</p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f2] p-5">
              <p className="text-sm text-[var(--muted)]">Accuracy</p>
              <p className="mt-1 text-3xl font-black">{targetResult.accuracyPercent}%</p>
            </div>
          </div>
          <button type="button" onClick={openTrace} className="button-primary tablet-button mt-8">
            Continue to Path Tracing
            <ArrowRightIcon />
          </button>
        </section>
        {demo ? (
          <WatchHowDialog demo={demo} onContinue={continueFromDemo} onClose={() => setDemo(null)} />
        ) : null}
      </>
    );
  }

  if (stage === "trace") {
    const drawnPoints = tracePoints.map((point) => `${point.x},${point.y}`).join(" ");
    return (
      <>
        <SessionProgress stage={stage} />
        <section className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff0eb] text-[var(--coral-dark)]">
                <TraceIcon />
              </span>
              <div>
                <h1 className="text-xl font-extrabold">Path Tracing</h1>
                <p className="text-sm text-[var(--muted)]">Start in green and finish in coral.</p>
              </div>
            </div>
            <span className="rounded-full bg-[#f1f3f1] px-4 py-2 text-sm font-bold capitalize">
              {pathWidth} path
            </span>
          </div>

          <div className="bg-[#eef5f3] p-2 sm:p-5">
            <svg
              viewBox="0 0 800 400"
              className="trace-board block h-[min(56vh,520px)] min-h-[360px] w-full rounded-2xl bg-white"
              onPointerDown={handleTraceStart}
              onPointerMove={handleTraceMove}
              onPointerUp={handleTraceEnd}
              onPointerCancel={handleTraceEnd}
              role="application"
              aria-label="Path Tracing activity. Begin in the green circle, follow the curved path, and finish in the coral circle."
            >
              <path d={tracePath} fill="none" stroke="#d8e9e6" strokeWidth={visiblePathWidth + 12} strokeLinecap="round" />
              <path d={tracePath} fill="none" stroke="#9bc5c0" strokeWidth={visiblePathWidth} strokeLinecap="round" />
              <path d={tracePath} fill="none" stroke="#12606b" strokeWidth="5" strokeDasharray="10 13" strokeLinecap="round" />
              <circle cx="90" cy="300" r="32" fill="#1f7a55" />
              <circle cx="90" cy="300" r="15" fill="white" opacity="0.88" />
              <circle cx="710" cy="100" r="32" fill="#ed775e" />
              <circle cx="710" cy="100" r="15" fill="white" opacity="0.88" />
              {drawnPoints ? (
                <polyline points={drawnPoints} fill="none" stroke="#163f86" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </svg>
          </div>

          <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
            <p className={`text-lg font-bold ${traceFeedback === "On track" ? "text-[var(--success)]" : ""}`} aria-live="polite">
              {traceFeedback}
            </p>
            <p className="text-sm font-semibold text-[var(--muted)]">Attempts: {traceAttempts}</p>
          </div>
        </section>
      </>
    );
  }

  if (stage === "trace-complete" && traceResult) {
    return (
      <>
        <SessionProgress stage={stage} />
        <section className="surface p-7 text-center sm:p-10">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#dff3e9] text-[var(--success)]">
            <CheckIcon className="size-10" />
          </span>
          <p className="eyebrow mt-6">Both activities complete</p>
          <h1 className="mt-2 text-4xl font-black">Ready to save your session</h1>
          <div className="mx-auto mt-7 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f4f5f2] p-5">
              <p className="text-sm text-[var(--muted)]">On-path points</p>
              <p className="mt-1 text-3xl font-black">{traceResult.onPathPercent}%</p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f2] p-5">
              <p className="text-sm text-[var(--muted)]">Mean path deviation</p>
              <p className="mt-1 text-3xl font-black">{traceResult.meanPathDeviation}px</p>
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            These are interaction measurements only. The prototype does not make clinical interpretations.
          </p>
          <button
            type="button"
            onClick={saveCompletedSession}
            disabled={isPending}
            className="button-primary tablet-button mt-8"
          >
            Save session results
            <ArrowRightIcon />
          </button>
        </section>
      </>
    );
  }

  if (stage === "saving") {
    return (
      <section className="surface flex min-h-[480px] flex-col items-center justify-center p-8 text-center" aria-live="polite">
        <span className="size-14 animate-pulse rounded-full bg-[var(--teal)]" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-black">Saving session measurements</h1>
        <p className="mt-3 text-[var(--muted)]">Please keep this page open for a moment.</p>
      </section>
    );
  }

  return (
    <section className="surface flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
      <p className="eyebrow text-[var(--coral-dark)]">Save interrupted</p>
      <h1 className="mt-2 text-3xl font-black">The session was not saved</h1>
      <p className="mt-4 max-w-xl text-[var(--muted)]">{saveError}</p>
      <button type="button" onClick={saveCompletedSession} className="button-primary tablet-button mt-7">
        Try saving again
      </button>
    </section>
  );
}
