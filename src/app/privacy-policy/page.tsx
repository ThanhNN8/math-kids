import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chính Sách Quyền Riêng Tư — MathKids',
  description: 'Chính sách quyền riêng tư cho ứng dụng học toán MathKids',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-black text-indigo-600 mb-2">
          Chính Sách Quyền Riêng Tư
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Cập nhật lần cuối: 18/04/2026
        </p>

        <article className="prose prose-indigo max-w-none space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Giới thiệu</h2>
            <p>
              MathKids (&ldquo;chúng tôi&rdquo;, &ldquo;Ứng dụng&rdquo;) là website học toán
              miễn phí dành cho trẻ em lớp 1–3, được truy cập tại
              <a href="https://thanhnn8.github.io/math-kids/" className="text-indigo-600 underline ml-1">
                thanhnn8.github.io/math-kids
              </a>
              . Chính sách này mô tả dữ liệu chúng tôi thu thập, cách sử dụng và bảo mật.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Dữ liệu chúng tôi thu thập</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <b>Tài khoản cục bộ</b>: tên hiển thị, avatar, mật khẩu (đã mã hoá
                bằng bcrypt, lưu trên thiết bị bé qua localStorage).
              </li>
              <li>
                <b>Tài khoản đám mây (tuỳ chọn)</b>: email và mật khẩu đăng ký qua
                Firebase Authentication để đồng bộ dữ liệu giữa nhiều thiết bị.
              </li>
              <li>
                <b>Tiến trình học tập</b>: số sao, XP, độ chính xác, bảng nhân đã
                học, lịch sử phiên chơi, vật phẩm đã mua trong cửa hàng ảo.
              </li>
              <li>
                <b>Dữ liệu giọng nói</b>: khi bé bật micro để trả lời bằng giọng
                nói, dữ liệu âm thanh được xử lý trực tiếp bởi trình duyệt
                (Web Speech API). Chúng tôi <u>không ghi âm, không lưu trữ</u>
                {' '}và không gửi âm thanh về máy chủ.
              </li>
              <li>
                <b>Đăng nhập qua Facebook (nếu áp dụng)</b>: khi bạn chọn đăng
                nhập qua Facebook, chúng tôi nhận từ Facebook: tên công khai,
                ảnh đại diện và email (nếu bạn cho phép). Thông tin này chỉ
                dùng để tạo hồ sơ học của bé.
              </li>
            </ul>
            <p className="mt-3">
              Chúng tôi <b>không thu thập</b>: vị trí địa lý, danh bạ, ảnh,
              micro ghi âm nền, thông tin thanh toán, dữ liệu quảng cáo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Mục đích sử dụng</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Lưu tiến trình học và hiển thị thống kê cho bé &amp; phụ huynh.</li>
              <li>Đồng bộ dữ liệu giữa các thiết bị (nếu đăng ký tài khoản đám mây).</li>
              <li>Cải thiện chất lượng bài tập dựa trên độ chính xác và tốc độ trả lời.</li>
            </ul>
            <p className="mt-3">
              Chúng tôi <b>không bán, không chia sẻ</b> dữ liệu của bé cho bên
              thứ ba phục vụ mục đích quảng cáo hay tiếp thị.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Lưu trữ &amp; Bảo mật</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Dữ liệu tài khoản cục bộ lưu trên thiết bị của bạn (localStorage)
                và không rời thiết bị nếu không đăng ký đám mây.
              </li>
              <li>
                Dữ liệu đám mây lưu trên Google Firebase (Firestore &amp; Auth),
                mã hoá khi truyền tải qua HTTPS/TLS và áp dụng quy tắc bảo mật
                để mỗi người dùng chỉ truy cập được dữ liệu của chính mình.
              </li>
              <li>
                Mật khẩu tài khoản cục bộ được băm bằng bcrypt trước khi lưu.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">5. Trẻ em dưới 13 tuổi</h2>
            <p>
              MathKids phục vụ trẻ em với sự giám sát của phụ huynh. Chúng tôi
              khuyến khích phụ huynh tạo tài khoản và kích hoạt chế độ phụ
              huynh để theo dõi hoạt động của bé. Nếu bạn phát hiện con mình
              dưới 13 tuổi đã đăng ký mà không có sự cho phép của bạn, vui
              lòng liên hệ để chúng tôi xoá dữ liệu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">6. Quyền của bạn</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Yêu cầu xem, chỉnh sửa, hoặc xoá dữ liệu tài khoản bất kỳ lúc nào.</li>
              <li>
                Xoá tài khoản cục bộ: vào mục Hồ sơ → Xoá tài khoản. Dữ liệu
                localStorage bị xoá ngay lập tức.
              </li>
              <li>
                Xoá tài khoản đám mây: gửi email yêu cầu, chúng tôi sẽ xoá
                trong vòng 7 ngày làm việc.
              </li>
              <li>Rút lại quyền cấp qua Facebook bất kỳ lúc nào trong cài đặt Facebook của bạn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">7. Cookie &amp; Công nghệ theo dõi</h2>
            <p>
              MathKids sử dụng <code>localStorage</code> của trình duyệt để lưu
              phiên đăng nhập và tiến trình. Chúng tôi <b>không dùng cookie
              theo dõi</b> (tracking cookies), không tích hợp công cụ phân tích
              của bên thứ ba như Google Analytics hay Facebook Pixel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">8. Thay đổi chính sách</h2>
            <p>
              Chúng tôi có thể cập nhật chính sách theo thời gian. Phiên bản
              mới nhất sẽ được đăng tại chính URL này kèm ngày cập nhật.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">9. Liên hệ</h2>
            <p>
              Nếu có thắc mắc về quyền riêng tư, vui lòng liên hệ:
            </p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li>📧 Email: <a href="mailto:ngocthanh2005@gmail.com" className="text-indigo-600 underline">ngocthanh2005@gmail.com</a></li>
              <li>🌐 Website: <a href="https://thanhnn8.github.io/math-kids/" className="text-indigo-600 underline">thanhnn8.github.io/math-kids</a></li>
            </ul>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-indigo-600 hover:underline">← Về trang chủ</Link>
          <Link href="/terms-of-service" className="text-indigo-600 hover:underline">Điều khoản dịch vụ</Link>
        </div>
      </div>
    </main>
  );
}
