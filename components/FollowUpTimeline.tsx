// "use client"

// import { JSX } from "react"
// import { CalendarDays, Phone, Mail, MessageCircle, PackageCheck, FileText, Users } from "lucide-react"
// import { cn } from "@/lib/utils"



// export type FollowUp = {
//   id: string
//   type: string
//   content: string
//   follow_up_time: string
//   next_follow_up_date?: string
//   is_important?: boolean
// }

// export default function FollowUpTimeline({ followUps }: { followUps: FollowUp[] }) {
//   const typeIconMap: Record<string, JSX.Element> = {
//     电话: <Phone className="w-4 h-4 text-blue-600" />,
//     邮件: <Mail className="w-4 h-4 text-green-600" />,
//     WhatsApp: <MessageCircle className="w-4 h-4 text-emerald-600" />,
//     样品: <PackageCheck className="w-4 h-4 text-orange-500" />,
//     报价: <FileText className="w-4 h-4 text-purple-500" />,
//     拜访: <Users className="w-4 h-4 text-pink-500" />,
//     其他: <CalendarDays className="w-4 h-4 text-gray-500" />,
//   }

//   return (
//     <div className="space-y-6">
//       {followUps.map((item) => (
//         <div key={item.id} className="relative pl-6 border-l border-gray-300">
//           <div className="absolute -left-[10px] top-1.5 bg-white rounded-full border border-gray-300 p-1">
//             {typeIconMap[item.type] || <CalendarDays className="w-4 h-4 text-gray-500" />}
//           </div>

//           <div className={cn("ml-2 space-y-1", item.is_important && "bg-yellow-50 border border-yellow-300 rounded-xl p-3")}>
//             <div className="text-sm font-medium">
//               <span className="text-gray-700">{item.type}</span>
//               <span className="text-xs text-gray-500 ml-2">
//                 {new Date(item.follow_up_time).toLocaleString()}
//               </span>
//             </div>
//             <div className="text-sm text-gray-800">{item.content}</div>
//             {item.next_follow_up_date && (
//               <div className="text-xs text-gray-500">
//                 📅 下次联系：{item.next_follow_up_date}
//               </div>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }



"use client"

import { JSX } from "react"
import { CalendarDays, Phone, Mail, MessageCircle, PackageCheck,FileText ,Users} from "lucide-react"
import { cn } from "@/lib/utils"

export type FollowUp = {
  id: string
  inquiry_id: string
  action_date: string // ISO 日期字符串
  method: '邮件' | '电话' | 'WhatsApp' | '样品' | '报价' | '拜访'| '其他'
  content: string
  next_action?: string // ISO 日期字符串
  user_id?: string
  created_at: string
}

export default function FollowUpTimeline({ followUps }: { followUps: FollowUp[] }) {
  const typeIconMap: Record<FollowUp["method"], JSX.Element> = {
    电话: <Phone className="w-4 h-4 text-blue-600" />,
    邮件: <Mail className="w-4 h-4 text-green-600" />,
    WhatsApp: <MessageCircle className="w-4 h-4 text-emerald-600" />,
    样品: <PackageCheck className="w-4 h-4 text-orange-500" />,
    报价: <FileText className="w-4 h-4 text-purple-500" />,
    拜访: <Users className="w-4 h-4 text-pink-500" />,
    其他: <CalendarDays className="w-4 h-4 text-gray-500" />,
  }

  return (
    <div className="space-y-6">
      {followUps.map((item) => (
        <div key={item.id} className="relative pl-6 border-l border-gray-300">
          <div className="absolute -left-[10px] top-1.5 bg-white rounded-full border border-gray-300 p-1">
            {typeIconMap[item.method] || <CalendarDays className="w-4 h-4 text-gray-500" />}
          </div>

          <div className={cn("ml-2 space-y-1")}>
            <div className="text-sm font-medium">
              <span className="text-gray-700">{item.method}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(item.action_date).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-800">{item.content}</div>
            {item.next_action && (
              <div className="text-xs text-gray-500">
                📅 下次联系：{item.next_action}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

