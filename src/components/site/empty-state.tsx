import type { ComponentType, ReactNode } from "react";
import { Inbox } from "lucide-react";

interface Props {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, desc, action }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
