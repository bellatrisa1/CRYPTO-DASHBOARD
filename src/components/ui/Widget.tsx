import type { PropsWithChildren, ReactNode } from 'react';

type WidgetProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function Widget({ title, subtitle, action, children }: WidgetProps) {
  return (
    <article className="widget">
      <div className="widget__header">
        <div>
          <h2 className="widget__title">{title}</h2>
          {subtitle ? <p className="widget__subtitle">{subtitle}</p> : null}
        </div>

        {action ? <div className="widget__action">{action}</div> : null}
      </div>

      <div className="widget__body">{children}</div>
    </article>
  );
}
