import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ — MathKids',
  description: 'Điều khoản sử dụng ứng dụng học toán MathKids',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-dvh bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-black text-indigo-600 mb-2">
          Điều Khoản Dịch Vụ
        </h1>
        <p className="text-sm text-gray-500 mb-8">Cập nhật lần cuối: 18/04/2026</p>

        <article className="prose prose-indigo max-w-none space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Chấp nhận điều khoản</h2>
            <p>
              Khi truy cập hoặc sử dụng website MathKids tại
              <a href="https://thanhnn8.github.io/math-kids/" className="text-indigo-600 underline ml-1">
                thanhnn8.github.io/math-kids
              </a>
              {' '}(sau đây gọi là &ldquo;Dịch vụ&rdquo;), bạn đồng ý với các điều khoản dưới đây.
              Nếu không đồng ý, vui lòng ngừng sử dụng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Mô tả dịch vụ</h2>
            <p>
              MathKids là ứng dụng web miễn phí giúp trẻ em học và luyện tập
              toán học cấp 1 thông qua các bài tập, đề thi mẫu và mini-game
              (Đua xe, Bắn phi thuyền, Xếp hình, Đua Xe Ăn Xăng). Dịch vụ
              hiện không có tính năng trả phí; mọi vật phẩm trong cửa hàng
              đều mua bằng sao ảo kiếm được qua học tập.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Đăng ký &amp; tài khoản</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Bạn có thể sử dụng dịch vụ với <b>tài khoản cục bộ</b>
                {' '}(chỉ lưu trên thiết bị) hoặc <b>tài khoản đám mây</b>
                {' '}(email + Firebase).
              </li>
              <li>
                Trẻ em dưới 13 tuổi cần sự đồng ý và giám sát của phụ huynh
                khi đăng ký.
              </li>
              <li>
                Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.
              </li>
              <li>
                Thông tin đăng ký (tên, email) phải là thông tin thật hoặc
                bí danh hợp lệ; không được giả mạo người khác.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Sử dụng được phép</h2>
            <p>Bạn đồng ý <b>không</b>:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sử dụng dịch vụ cho mục đích trái pháp luật.</li>
              <li>Cố gắng xâm nhập, dò quét, hay phá hoại hệ thống.</li>
              <li>Sao chép, sửa đổi, phân phối lại mã nguồn hoặc nội dung đề thi mà không được phép.</li>
              <li>Gửi nội dung độc hại, spam, hay gây hại cho người dùng khác.</li>
              <li>Sử dụng bot/script tự động để &ldquo;cày&rdquo; sao hay vật phẩm ảo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">5. Nội dung &amp; sở hữu trí tuệ</h2>
            <p>
              Toàn bộ nội dung bài tập, hình ảnh, code và thiết kế thuộc bản
              quyền của chủ sở hữu MathKids. Nội dung đề thi tham khảo từ
              chương trình Giáo dục phổ thông 2018 của Bộ Giáo dục và Đào tạo
              Việt Nam và các sách giáo khoa Chân Trời Sáng Tạo, Kết Nối Tri
              Thức, Cánh Diều.
            </p>
            <p className="mt-2">
              Vật phẩm ảo bé mua bằng sao trong cửa hàng không có giá trị quy
              đổi ra tiền mặt hay hàng hoá thực.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">6. Dữ liệu cá nhân</h2>
            <p>
              Việc thu thập và xử lý dữ liệu được nêu chi tiết trong
              <Link href="/privacy-policy" className="text-indigo-600 underline ml-1">
                Chính sách Quyền riêng tư
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">7. Dịch vụ bên thứ ba</h2>
            <p>MathKids tích hợp các dịch vụ sau:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><b>Google Firebase</b>: Authentication &amp; Firestore để đồng bộ dữ liệu.</li>
              <li><b>Web Speech API của trình duyệt</b>: nhận diện giọng nói tiếng Việt khi bé bật micro.</li>
              <li><b>Facebook Login (nếu áp dụng)</b>: tuỳ chọn đăng nhập nhanh qua Facebook.</li>
            </ul>
            <p className="mt-2">
              Các dịch vụ này có điều khoản riêng; chúng tôi không chịu trách
              nhiệm cho hành vi của bên thứ ba.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">8. Tuyên bố miễn trừ</h2>
            <p>
              Dịch vụ được cung cấp &ldquo;nguyên trạng&rdquo; (as-is) và &ldquo;khi sẵn có&rdquo;
              (as-available) mà không có bảo đảm dưới bất kỳ hình thức nào.
              Chúng tôi không đảm bảo dịch vụ luôn chạy không gián đoạn, không
              có lỗi, hoặc nội dung đề thi hoàn toàn chính xác 100%.
            </p>
            <p className="mt-2">
              Trong phạm vi pháp luật cho phép, MathKids không chịu trách
              nhiệm cho mọi thiệt hại gián tiếp hay hệ quả phát sinh từ việc
              sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">9. Chấm dứt</h2>
            <p>
              Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản của bạn nếu
              phát hiện vi phạm các điều khoản này. Bạn cũng có thể tự xoá tài
              khoản bất kỳ lúc nào trong phần Hồ sơ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">10. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi có thể cập nhật điều khoản theo thời gian. Bản cập
              nhật sẽ được đăng tại URL này kèm ngày cập nhật. Việc bạn tiếp
              tục sử dụng dịch vụ sau khi cập nhật được coi là đồng ý với
              điều khoản mới.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">11. Luật áp dụng</h2>
            <p>
              Các điều khoản này được điều chỉnh theo pháp luật Việt Nam. Mọi
              tranh chấp sẽ được giải quyết tại toà án có thẩm quyền tại
              Việt Nam.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">12. Liên hệ</h2>
            <p>Mọi thắc mắc, khiếu nại, yêu cầu gỡ bỏ dữ liệu xin liên hệ:</p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li>📧 Email: <a href="mailto:ngocthanh2005@gmail.com" className="text-indigo-600 underline">ngocthanh2005@gmail.com</a></li>
              <li>🌐 Website: <a href="https://thanhnn8.github.io/math-kids/" className="text-indigo-600 underline">thanhnn8.github.io/math-kids</a></li>
            </ul>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-indigo-600 hover:underline">← Về trang chủ</Link>
          <Link href="/privacy-policy" className="text-indigo-600 hover:underline">Chính sách quyền riêng tư</Link>
        </div>
      </div>
    </main>
  );
}
