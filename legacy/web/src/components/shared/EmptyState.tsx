interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-2">
        {title}
      </h3>
      <p className="text-gray-smoky max-w-md mx-auto">{message}</p>
    </div>
  );
}
