type WidgetStateProps = {
  title: string;
  variant?: 'default' | 'warning' | 'error';
};

export function WidgetState({ title, variant = 'default' }: WidgetStateProps) {
  return (
    <div className={`widget-state widget-state--${variant}`}>
      <span>{title}</span>
    </div>
  );
}
