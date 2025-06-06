// components/FollowUpTimeline.tsx

import { FollowUp } from "@/lib/types"


interface FollowUpsProps {
    followUps: FollowUp[]
  }

export default function FollowUpTimeline({ followUps }:FollowUpsProps) {
    return (
      <ol className="relative border-s border-gray-200 dark:border-gray-700">
        {followUps.map((item, i) => (
          <li key={i} className="mb-10 ms-4">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -start-1.5 border border-white dark:border-gray-900" />
            <time className="mb-1 text-sm font-normal leading-none text-gray-400">{item.action_date}</time>
            <h3 className="text-lg font-semibold text-gray-900">{item.method}</h3>
            <p className="text-sm text-gray-500">{item.content}</p>
            {item.next_action && (
              <p className="text-xs text-orange-500 mt-1">下次联系：{item.next_action}</p>
            )}
          </li>
        ))}
      </ol>
    )
  }
  