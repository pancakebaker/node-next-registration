'use client';

type Props = {
  steps: readonly string[];
  activeIndex: number; // 0-based
};

export default function ProgressBar({ steps, activeIndex }: Props) {
  const progress = ((activeIndex + 1) / steps.length) * 100;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {steps.map((label, i) => (
          <div key={label} className="flex min-w-0 flex-1 items-center">
            <div
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium',
                i <= activeIndex
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 bg-white text-gray-500',
              ].join(' ')}
              aria-label={label}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="mx-2 hidden h-0.5 flex-1 rounded bg-gray-200 sm:block">
                <div
                  className="h-0.5 rounded bg-indigo-600 transition-[width]"
                  style={{
                    width:
                      i < activeIndex
                        ? '100%'
                        : i === activeIndex
                        ? `${Math.max(0, Math.min(100, progress - 50)) * 2}%`
                        : '0%',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-center text-sm font-medium text-gray-700">
        {steps[activeIndex]}
      </div>
    </div>
  );
}
