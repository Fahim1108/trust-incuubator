import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import type { OrderStatus, OrderTimelineEvent } from '@/types';
import styles from './OrderTimeline.module.css';

const stages: {status: OrderStatus; label: string}[] = [
  {status:'pending',label:'Order Placed'}, {status:'confirmed',label:'Order Confirmed'},
  {status:'packed',label:'Processing'}, {status:'shipped',label:'Shipped'},
  {status:'out-for-delivery',label:'Out for Delivery'}, {status:'delivered',label:'Delivered'},
];

/** Status and timestamps must come from an authorised order response, never from URL parameters. */
export function OrderTimeline({events,status}: {events:OrderTimelineEvent[];status?:OrderStatus}) {
  const current=status ?? [...events].reverse().find(event=>event.at)?.status;
  const terminal=current==='delivered'||current==='cancelled'||current==='returned';
  const visible=terminal&&current!=='delivered'?[...stages,{status:current,label:current==='cancelled'?'Cancelled':'Returned'}]:stages;
  return <div className={styles.container}><ol className={styles.timeline} aria-label="Order progress">
    {visible.map((stage,index)=>{
      const event=events.find(e=>e.status===stage.status);
      const active=stage.status===current;
      // A later status alone does not invent timestamps or completion for missing events.
      const completed=Boolean(event?.at)&&(!active||terminal);
      const next=events.find(e=>e.status===visible[index+1]?.status);
      return <li key={stage.status} className={styles.stage} aria-current={active?'step':undefined}>
        {index<visible.length-1&&<span className={cn(styles.line,completed&&next?.at&&styles.completedLine)} aria-hidden />}
        <span data-tracking-indicator className={cn(styles.indicator,(completed||active)&&styles.filled,active&&!terminal&&styles.active)} aria-hidden>{completed&&<Check size={15}/>}</span>
        <div><p className={cn('text-sm font-medium',active?'text-primary':'text-ink')}>{stage.label}</p>
          {active&&<span className="text-xs text-primary">{terminal?'Final status':'Current stage'}</span>}
          {event?.at&&<p className="text-xs text-ink-muted">{formatDateTime(event.at)}</p>}
          {event?.description&&<p className="mt-1 text-xs text-ink-muted">{event.description}</p>}
        </div>
      </li>;
    })}
  </ol></div>;
}
