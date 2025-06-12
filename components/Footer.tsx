// components/Footer.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧部分 - 公司信息 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">询盘跟踪</h4>
            <p className="text-sm">管理客户，管理询盘，跟踪询盘</p>
          </div>

          {/* 中间部分 - 快速链接 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul>
              <li>
                <Link href="/" passHref>
                  <Button variant="link" className="text-sm text-white hover:underline">首页</Button>
                </Link>
              </li>
              <li>
                <Link href="/customers/table" passHref>
                  <Button variant="link" className="text-sm text-white hover:underline">客户</Button>
                </Link>
              </li>
              <li>
                <Link href="/inquiries/table" passHref>
                  <Button variant="link" className="text-sm  text-white hover:underline">询盘</Button>
                </Link>
              </li>
              <li>
                <Link href="/import-customer" passHref>
                  <Button variant="link" className="text-sm  text-white hover:underline">+customers</Button>
                </Link>
              </li>
              <li>
                <Link href="/import-inquiries" passHref>
                  <Button variant="link" className="text-sm  text-white hover:underline">+inquiries</Button>
                </Link>
              </li>
            </ul>
          </div>

          {/* 右侧部分 - 社交媒体 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">社交媒体</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-2xl text-white  hover:text-blue-500">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-2xl text-white  hover:text-blue-400">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-2xl text-white  hover:text-pink-500">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm">© 2025 公司名称. 版权所有.</p>
        </div>
      </div>
    </footer>
  )
}
