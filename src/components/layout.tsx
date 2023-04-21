import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="dark flex h-fit justify-center">
      <div className="w-full border-x md:max-w-2xl">{props.children}</div>
    </main>
  );
};
