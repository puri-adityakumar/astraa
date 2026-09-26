export type Debounced<F extends (...args: never[]) => unknown> = F & {
  cancel: () => void;
};

export function debounce<F extends (...args: never[]) => unknown>(
  fn: F,
  ms: number,
): Debounced<F> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const wrapped = ((...args: Parameters<F>) => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  }) as Debounced<F>;

  wrapped.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return wrapped;
}
