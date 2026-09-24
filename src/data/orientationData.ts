import { 
  CriteriaKey, 
  CriteriaProfile, 
  OrientationQuestion, 
  MajorProfile, 
  MajorFitResult, 
  CriterionComparison,
  OrientationHistoryItem,
  Major,
  OrientationOption
} from '../types';
import { DETAILED_SCORE_RECORDS, MAJORS_DATA } from './admissionData';

/**
 * ============================================================================
 * 9 TIÊU CHÍ NỀN TẢNG ĐỊNH HƯỚNG HỌC TẬP & NGHỀ NGHIỆP TẠI USSH
 * Lưu ý: Đây là các tiêu chí mô tả đặc điểm/hồ sơ phù hợp với nhóm hoạt động
 * học tập và công việc do hệ thống thiết kế cho mục đích tư vấn, định hướng,
 * không phải tiêu chuẩn tuyển sinh chính thức của Trường ĐH KHXH&NV.
 * ============================================================================
 */
export const CRITERIA_KEYS: CriteriaKey[] = [
  'analysis',
  'communication',
  'socialHuman',
  'language',
  'creativity',
  'organization',
  'research',
  'international',
  'technologyData',
];

export const CRITERIA_METADATA: Record<CriteriaKey, { name: string; description: string; color: string }> = {
  analysis: { 
    name: 'Phân tích', 
    description: 'Tư duy logic, giải quyết vấn đề, phân tích cấu trúc dữ liệu và sự kiện.',
    color: '#0284c7' 
  },
  communication: { 
    name: 'Giao tiếp', 
    description: 'Năng lực biểu đạt ngôn từ, truyền thông, thuyết trình và kết nối công chúng.',
    color: '#0d9488' 
  },
  socialHuman: { 
    name: 'Xã hội – con người', 
    description: 'Thấu hiểu hành vi, tâm lý, đồng cảm và quan tâm đến các vấn đề an sinh xã hội.',
    color: '#ea580c' 
  },
  language: { 
    name: 'Ngôn ngữ', 
    description: 'Cảm thụ ngữ văn, năng lực ngoại ngữ, biên phiên dịch và giao tiếp liên văn hóa.',
    color: '#7c3aed' 
  },
  creativity: { 
    name: 'Sáng tạo', 
    description: 'Ý tưởng đổi mới, năng khiếu thẩm mỹ, sản xuất nội dung nghệ thuật và phương tiện mới.',
    color: '#db2777' 
  },
  organization: { 
    name: 'Tổ chức – quản lý', 
    description: 'Kế hoạch hóa, điều phối sự kiện, quản trị vận hành và giải quyết tình huống.',
    color: '#ca8a04' 
  },
  research: { 
    name: 'Nghiên cứu', 
    description: 'Khảo cứu học thuật, tra cứu tư liệu lịch sử, đọc hiểu sâu và phân tích tài liệu.',
    color: '#1e40af' 
  },
  international: { 
    name: 'Đối ngoại – quốc tế', 
    description: 'Tầm nhìn toàn cầu, đàm phán đa phương, ngoại giao và hội nhập quốc tế.',
    color: '#047857' 
  },
  technologyData: { 
    name: 'Công nghệ – dữ liệu', 
    description: 'Ứng dụng công cụ số, AI, phân tích định lượng và xử lý thông tin thời đại số.',
    color: '#4f46e5' 
  },
};

/**
 * ============================================================================
 * Bộ câu hỏi cũ được giữ lại để dữ liệu khảo sát đã lưu trong localStorage
 * không bị mất tham chiếu khi người dùng mở lại lịch sử.
 * ============================================================================
 */
const LEGACY_ORIENTATION_QUESTIONS: OrientationQuestion[] = [
  {
    id: 1,
    weight: 1,
    text: 'Khi rảnh rỗi hoặc làm bài tập nhóm, bạn cảm thấy hứng thú nhất với công việc nào sau đây?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 hoạt động bạn yêu thích nhất',
    options: [
      {
        id: 'q1_opt1',
        label: 'Viết nội dung bài viết, lên ý tưởng clip ngắn hoặc thiết kế ấn phẩm đồ họa',
        profile: { analysis: 1, communication: 4, socialHuman: 2, language: 3, creativity: 5, organization: 2, research: 2, international: 1, technologyData: 4 }
      },
      {
        id: 'q1_opt2',
        label: 'Học một ngoại ngữ mới, xem phim có phụ đề và tìm hiểu văn hóa các nước',
        profile: { analysis: 2, communication: 3, socialHuman: 2, language: 5, creativity: 2, organization: 1, research: 3, international: 5, technologyData: 1 }
      },
      {
        id: 'q1_opt3',
        label: 'Lắng nghe, thấu cảm tâm sự của bạn bè và tìm cách gỡ rối tâm lý cho họ',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 1, creativity: 1, organization: 2, research: 3, international: 1, technologyData: 0 }
      },
      {
        id: 'q1_opt4',
        label: 'Tìm đọc về các sự kiện lịch sử, nhân vật văn học kinh điển và tư tưởng nhân loại',
        profile: { analysis: 4, communication: 2, socialHuman: 3, language: 4, creativity: 2, organization: 1, research: 5, international: 3, technologyData: 1 }
      },
      {
        id: 'q1_opt5',
        label: 'Lên lịch trình du lịch, săn vé máy bay và dẫn bạn bè đi khám phá địa điểm mới',
        profile: { analysis: 2, communication: 4, socialHuman: 3, language: 2, creativity: 2, organization: 5, research: 2, international: 4, technologyData: 2 }
      },
      {
        id: 'q1_opt6',
        label: 'Theo dõi tin tức thời sự quốc tế, chính sách ngoại giao và quan hệ đa phương',
        profile: { analysis: 4, communication: 3, socialHuman: 3, language: 4, creativity: 1, organization: 2, research: 4, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 2,
    weight: 1,
    text: 'Môi trường làm việc lý tưởng trong tương lai mà bạn luôn hình dung là:',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 môi trường phù hợp với bạn nhất',
    options: [
      {
        id: 'q2_opt1',
        label: 'Toà soạn báo chí hiện đại, công ty truyền thông sáng tạo, năng động',
        profile: { analysis: 2, communication: 5, socialHuman: 3, language: 3, creativity: 5, organization: 3, research: 3, international: 2, technologyData: 4 }
      },
      {
        id: 'q2_opt2',
        label: 'Tập đoàn đa quốc gia, công ty liên doanh nước ngoài hoặc viện dịch thuật',
        profile: { analysis: 3, communication: 4, socialHuman: 2, language: 5, creativity: 2, organization: 4, research: 3, international: 5, technologyData: 3 }
      },
      {
        id: 'q2_opt3',
        label: 'Phòng tham vấn tâm lý, trung tâm nhân sự hoặc tổ chức phi chính phủ (NGO)',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 2, creativity: 1, organization: 3, research: 4, international: 2, technologyData: 1 }
      },
      {
        id: 'q2_opt4',
        label: 'Viện nghiên cứu, bảo tàng, trường đại học hoặc nhà xuất bản danh tiếng',
        profile: { analysis: 4, communication: 2, socialHuman: 2, language: 4, creativity: 2, organization: 2, research: 5, international: 2, technologyData: 2 }
      },
      {
        id: 'q2_opt5',
        label: 'Khách sạn 5 sao quốc tế, công ty du lịch lữ hành với những chuyến đi khắp nơi',
        profile: { analysis: 1, communication: 5, socialHuman: 3, language: 4, creativity: 2, organization: 5, research: 1, international: 4, technologyData: 2 }
      },
      {
        id: 'q2_opt6',
        label: 'Đại sứ quán, các tổ chức Liên Hợp Quốc hoặc cơ quan ngoại vụ đối ngoại',
        profile: { analysis: 4, communication: 4, socialHuman: 3, language: 5, creativity: 1, organization: 3, research: 4, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 3,
    weight: 1,
    text: 'Điểm mạnh nổi bật nhất mà bạn bè hay nhận xét về bạn là gì?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 thế mạnh tự tin nhất',
    options: [
      {
        id: 'q3_opt1',
        label: 'Khả năng biểu đạt ngôn từ trôi chảy, nhạy bén với các trào lưu mới',
        profile: { analysis: 2, communication: 5, socialHuman: 3, language: 4, creativity: 4, organization: 2, research: 2, international: 2, technologyData: 3 }
      },
      {
        id: 'q3_opt2',
        label: 'Khả năng phát âm chuẩn, ghi nhớ từ vựng tốt và phản xạ ngoại ngữ tự nhiên',
        profile: { analysis: 2, communication: 4, socialHuman: 1, language: 5, creativity: 2, organization: 2, research: 3, international: 4, technologyData: 1 }
      },
      {
        id: 'q3_opt3',
        label: 'Sự kiên nhẫn, điềm tĩnh, biết quan sát cảm xúc và hành vi người đối diện',
        profile: { analysis: 4, communication: 3, socialHuman: 5, language: 1, creativity: 1, organization: 3, research: 4, international: 1, technologyData: 0 }
      },
      {
        id: 'q3_opt4',
        label: 'Tư duy phản biện sâu sắc, thích chất vấn bản chất của sự việc và đọc sách sâu',
        profile: { analysis: 5, communication: 3, socialHuman: 2, language: 3, creativity: 2, organization: 2, research: 5, international: 2, technologyData: 1 }
      },
      {
        id: 'q3_opt5',
        label: 'Kỹ năng hoạt náo, điều phối đám đông và xử lý tình huống linh hoạt tại chỗ',
        profile: { analysis: 2, communication: 5, socialHuman: 4, language: 2, creativity: 3, organization: 5, research: 1, international: 3, technologyData: 1 }
      },
      {
        id: 'q3_opt6',
        label: 'Tầm nhìn rộng mở, khéo léo đàm phán và hiểu biết rộng về các nền chính trị',
        profile: { analysis: 4, communication: 4, socialHuman: 3, language: 4, creativity: 2, organization: 3, research: 4, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 4,
    weight: 1,
    text: 'Môn học nào ở trường THPT bạn đạt kết quả tốt và có cảm hứng nhất?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 môn học tạo cảm hứng nhất',
    options: [
      {
        id: 'q4_opt1',
        label: 'Ngữ văn (đặc biệt là các bài văn nghị luận xã hội, bình luận báo chí)',
        profile: { analysis: 3, communication: 5, socialHuman: 4, language: 5, creativity: 4, organization: 2, research: 4, international: 2, technologyData: 1 }
      },
      {
        id: 'q4_opt2',
        label: 'Tiếng Anh hoặc các ngoại ngữ thứ 2 (Trung, Nhật, Pháp...)',
        profile: { analysis: 2, communication: 4, socialHuman: 2, language: 5, creativity: 2, organization: 2, research: 3, international: 5, technologyData: 2 }
      },
      {
        id: 'q4_opt3',
        label: 'Giáo dục công dân, Xã hội học và hoạt động trải nghiệm hướng nghiệp',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 2, creativity: 2, organization: 3, research: 3, international: 2, technologyData: 1 }
      },
      {
        id: 'q4_opt4',
        label: 'Lịch sử và Ngữ văn văn học sử',
        profile: { analysis: 4, communication: 2, socialHuman: 3, language: 4, creativity: 2, organization: 1, research: 5, international: 3, technologyData: 1 }
      },
      {
        id: 'q4_opt5',
        label: 'Địa lí tự nhiên và Địa lí kinh tế - xã hội các vùng miền',
        profile: { analysis: 4, communication: 3, socialHuman: 3, language: 2, creativity: 2, organization: 4, research: 4, international: 3, technologyData: 2 }
      },
      {
        id: 'q4_opt6',
        label: 'Lịch sử thế giới và Tiếng Anh giao tiếp quốc tế',
        profile: { analysis: 4, communication: 3, socialHuman: 2, language: 5, creativity: 1, organization: 2, research: 4, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 5,
    weight: 1,
    text: 'Khi bắt đầu một dự án hoặc đề tài nghiên cứu nhóm, bạn muốn đóng vai trò nào?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 vai trò bạn tự tin đảm nhận',
    options: [
      {
        id: 'q5_opt1',
        label: 'Lên cấu trúc đề cương, phân chia tiến độ và quản lý việc thực hiện của từng thành viên',
        profile: { analysis: 3, communication: 3, socialHuman: 2, language: 1, creativity: 2, organization: 5, research: 3, international: 1, technologyData: 2 }
      },
      {
        id: 'q5_opt2',
        label: 'Tìm kiếm nguồn tài liệu học thuật trong và ngoài nước, đối chiếu các quan điểm khoa học',
        profile: { analysis: 5, communication: 2, socialHuman: 1, language: 4, creativity: 1, organization: 2, research: 5, international: 3, technologyData: 2 }
      },
      {
        id: 'q5_opt3',
        label: 'Thiết kế slide trình chiếu, đồ họa trực quan và biên soạn bài thuyết trình ấn tượng',
        profile: { analysis: 2, communication: 4, socialHuman: 2, language: 3, creativity: 5, organization: 2, research: 2, international: 2, technologyData: 4 }
      },
      {
        id: 'q5_opt4',
        label: 'Đại diện nhóm thuyết trình, điều phối phần hỏi đáp và phản biện trước lớp',
        profile: { analysis: 4, communication: 5, socialHuman: 3, language: 3, creativity: 3, organization: 3, research: 3, international: 2, technologyData: 1 }
      },
      {
        id: 'q5_opt5',
        label: 'Thu thập bảng hỏi khảo sát thực tế, phân tích số liệu thống kê và vẽ biểu đồ',
        profile: { analysis: 5, communication: 2, socialHuman: 3, language: 1, creativity: 1, organization: 3, research: 4, international: 1, technologyData: 5 }
      },
      {
        id: 'q5_opt6',
        label: 'Liên hệ chuyên gia ngoài trường hoặc tìm tài liệu song ngữ quốc tế để làm phong phú đề tài',
        profile: { analysis: 3, communication: 4, socialHuman: 3, language: 4, creativity: 2, organization: 3, research: 3, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 6,
    weight: 1,
    text: 'Khi gặp một vấn đề bạn chưa biết, bạn thường...',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 cách phản ứng tự nhiên nhất của bạn',
    options: [
      {
        id: 'q6_opt1',
        label: 'Tìm dữ liệu để kiểm tra',
        profile: { analysis: 5, communication: 1, socialHuman: 1, language: 1, creativity: 1, organization: 2, research: 4, international: 1, technologyData: 4 }
      },
      {
        id: 'q6_opt2',
        label: 'Hỏi người có kinh nghiệm',
        profile: { analysis: 2, communication: 5, socialHuman: 4, language: 2, creativity: 1, organization: 3, research: 2, international: 1, technologyData: 1 }
      },
      {
        id: 'q6_opt3',
        label: 'Tìm nhiều nguồn tài liệu',
        profile: { analysis: 4, communication: 2, socialHuman: 2, language: 3, creativity: 1, organization: 2, research: 5, international: 2, technologyData: 2 }
      },
      {
        id: 'q6_opt4',
        label: 'Thử một cách giải quyết mới',
        profile: { analysis: 3, communication: 2, socialHuman: 2, language: 1, creativity: 5, organization: 2, research: 2, international: 1, technologyData: 3 }
      },
      {
        id: 'q6_opt5',
        label: 'Quan sát tác động đến con người',
        profile: { analysis: 3, communication: 3, socialHuman: 5, language: 1, creativity: 2, organization: 2, research: 3, international: 1, technologyData: 0 }
      },
      {
        id: 'q6_opt6',
        label: 'Tìm cách tổ chức lại vấn đề',
        profile: { analysis: 4, communication: 2, socialHuman: 2, language: 1, creativity: 2, organization: 5, research: 2, international: 1, technologyData: 2 }
      },
      {
        id: 'q6_opt7',
        label: 'Tìm công cụ công nghệ hỗ trợ',
        profile: { analysis: 4, communication: 1, socialHuman: 1, language: 1, creativity: 3, organization: 2, research: 3, international: 2, technologyData: 5 }
      },
      {
        id: 'q6_opt8',
        label: 'Tìm tài liệu bằng ngoại ngữ',
        profile: { analysis: 3, communication: 2, socialHuman: 2, language: 5, creativity: 1, organization: 2, research: 4, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 7,
    weight: 1,
    text: 'Dự án ngoại khóa hoặc hoạt động cộng đồng nào sau đây kích thích bạn tham gia nhất?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 hoạt động',
    options: [
      {
        id: 'q7_opt1',
        label: 'Chiến dịch truyền thông mạng xã hội nhằm nâng cao nhận thức bảo vệ môi trường',
        profile: { analysis: 2, communication: 5, socialHuman: 4, language: 2, creativity: 5, organization: 3, research: 2, international: 2, technologyData: 4 }
      },
      {
        id: 'q7_opt2',
        label: 'Dự án tham vấn đồng đẳng, hỗ trợ tâm lý cho học sinh chịu áp lực học đường',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 1, creativity: 1, organization: 3, research: 3, international: 1, technologyData: 0 }
      },
      {
        id: 'q7_opt3',
        label: 'Chương trình giao lưu thanh niên quốc tế, đón tiếp đoàn sinh viên nước ngoài',
        profile: { analysis: 2, communication: 5, socialHuman: 3, language: 5, creativity: 2, organization: 4, research: 2, international: 5, technologyData: 2 }
      },
      {
        id: 'q7_opt4',
        label: 'Dự án điền dã khảo sát văn hóa, phỏng vấn nhân chứng lịch sử và số hóa tư liệu di sản',
        profile: { analysis: 4, communication: 3, socialHuman: 4, language: 2, creativity: 2, organization: 2, research: 5, international: 2, technologyData: 3 }
      },
      {
        id: 'q7_opt5',
        label: 'Khảo sát nhu cầu cộng đồng, thiết kế mô hình an sinh và vận động nguồn lực xã hội',
        profile: { analysis: 4, communication: 3, socialHuman: 5, language: 1, creativity: 2, organization: 5, research: 4, international: 1, technologyData: 2 }
      },
      {
        id: 'q7_opt6',
        label: 'CLB Dịch thuật tác phẩm văn học hoặc phụ đề phim tài liệu khoa học xã hội',
        profile: { analysis: 3, communication: 3, socialHuman: 2, language: 5, creativity: 4, organization: 2, research: 4, international: 4, technologyData: 2 }
      },
    ],
  },
  {
    id: 8,
    weight: 1,
    text: 'Khi theo dõi tin tức hàng ngày, thể loại nội dung nào bạn thường dừng lại đọc kỹ nhất?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 chủ đề bạn quan tâm nhất',
    options: [
      {
        id: 'q8_opt1',
        label: 'Bài phóng sự điều tra, các câu chuyện con người xúc động và góc nhìn đời sống đa chiều',
        profile: { analysis: 4, communication: 5, socialHuman: 5, language: 3, creativity: 3, organization: 2, research: 4, international: 2, technologyData: 2 }
      },
      {
        id: 'q8_opt2',
        label: 'Tin tức địa chính trị thế giới, các cuộc đàm phán song phương và hội nghị thượng đỉnh',
        profile: { analysis: 4, communication: 3, socialHuman: 2, language: 4, creativity: 1, organization: 2, research: 4, international: 5, technologyData: 2 }
      },
      {
        id: 'q8_opt3',
        label: 'Các nghiên cứu về tâm lý con người, giải mã hành vi đám đông và sức khỏe tinh thần',
        profile: { analysis: 4, communication: 3, socialHuman: 5, language: 2, creativity: 2, organization: 1, research: 5, international: 2, technologyData: 2 }
      },
      {
        id: 'q8_opt4',
        label: 'Các bài bình luận văn học nghệ thuật, khảo cứu lịch sử cổ đại và nguồn gốc phong tục',
        profile: { analysis: 3, communication: 2, socialHuman: 3, language: 5, creativity: 3, organization: 1, research: 5, international: 3, technologyData: 1 }
      },
      {
        id: 'q8_opt5',
        label: 'Báo cáo xu hướng công nghệ số, trí tuệ nhân tạo (AI) và cách mạng dữ liệu lớn',
        profile: { analysis: 5, communication: 2, socialHuman: 2, language: 2, creativity: 3, organization: 2, research: 4, international: 3, technologyData: 5 }
      },
      {
        id: 'q8_opt6',
        label: 'Bài viết về điểm đến du lịch mới, trải nghiệm văn hóa bản địa và ẩm thực bốn phương',
        profile: { analysis: 2, communication: 4, socialHuman: 3, language: 3, creativity: 3, organization: 4, research: 2, international: 4, technologyData: 2 }
      },
    ],
  },
  {
    id: 9,
    weight: 1,
    text: 'Khi đối mặt với một vấn đề tranh cãi gay gắt, phản xạ tư duy của bạn thường là:',
    maxSelect: 1,
    hint: 'Chọn 1 phản xạ gần nhất với bạn',
    options: [
      {
        id: 'q9_opt1',
        label: 'Tìm bằng chứng dữ liệu, tài liệu xác thực để làm rõ đúng – sai một cách khách quan',
        profile: { analysis: 5, communication: 2, socialHuman: 1, language: 2, creativity: 1, organization: 2, research: 5, international: 2, technologyData: 4 }
      },
      {
        id: 'q9_opt2',
        label: 'Lắng nghe quan điểm của các bên, tìm hiểu căn nguyên cảm xúc và hòa giải bất đồng',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 2, creativity: 2, organization: 3, research: 3, international: 2, technologyData: 0 }
      },
      {
        id: 'q9_opt3',
        label: 'Phân tích góc độ luật lệ, quy chuẩn tổ chức và đề xuất nguyên tắc giải quyết',
        profile: { analysis: 4, communication: 3, socialHuman: 3, language: 2, creativity: 1, organization: 5, research: 3, international: 2, technologyData: 1 }
      },
      {
        id: 'q9_opt4',
        label: 'Diễn giải lại quan điểm bằng ngôn từ khéo léo, tránh xung đột và tìm tiếng nói chung',
        profile: { analysis: 3, communication: 5, socialHuman: 4, language: 4, creativity: 3, organization: 2, research: 2, international: 4, technologyData: 1 }
      },
      {
        id: 'q9_opt5',
        label: 'Xem xét bối cảnh lịch sử và văn hóa để hiểu vì sao mỗi bên lại có quan điểm như vậy',
        profile: { analysis: 4, communication: 2, socialHuman: 4, language: 3, creativity: 2, organization: 1, research: 5, international: 4, technologyData: 1 }
      },
    ],
  },
  {
    id: 10,
    weight: 1,
    text: 'Nếu được cấp kinh phí thực hiện một đề tài trải nghiệm thực tế, bạn sẽ chọn hướng nào?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 hướng bạn hào hứng nhất',
    options: [
      {
        id: 'q10_opt1',
        label: 'Sản xuất một bộ phim tài liệu ngắn phản ánh đời sống người lao động đô thị',
        profile: { analysis: 3, communication: 5, socialHuman: 5, language: 3, creativity: 5, organization: 3, research: 3, international: 1, technologyData: 4 }
      },
      {
        id: 'q10_opt2',
        label: 'Khảo sát và ghi chép truyện kể dân gian, di tích làng nghề truyền thống trước nguy cơ mai một',
        profile: { analysis: 3, communication: 2, socialHuman: 4, language: 4, creativity: 2, organization: 2, research: 5, international: 2, technologyData: 2 }
      },
      {
        id: 'q10_opt3',
        label: 'Tham gia đoàn giao lưu văn hóa thanh niên các nước Đông Nam Á (ASEAN)',
        profile: { analysis: 2, communication: 4, socialHuman: 3, language: 5, creativity: 2, organization: 3, research: 2, international: 5, technologyData: 1 }
      },
      {
        id: 'q10_opt4',
        label: 'Khảo sát thực tế đánh giá tác động của mạng xã hội đến tâm lý vị thành niên',
        profile: { analysis: 5, communication: 3, socialHuman: 5, language: 1, creativity: 2, organization: 2, research: 4, international: 1, technologyData: 3 }
      },
      {
        id: 'q10_opt5',
        label: 'Thiết kế hành trình tour du lịch sinh thái kết hợp giáo dục di sản cho học sinh',
        profile: { analysis: 2, communication: 4, socialHuman: 3, language: 2, creativity: 4, organization: 5, research: 3, international: 3, technologyData: 2 }
      },
      {
        id: 'q10_opt6',
        label: 'Xây dựng cơ sở dữ liệu số hóa văn bản lưu trữ cổ và phát triển ứng dụng tra cứu',
        profile: { analysis: 5, communication: 1, socialHuman: 1, language: 3, creativity: 2, organization: 3, research: 5, international: 2, technologyData: 5 }
      },
    ],
  },
  {
    id: 11,
    weight: 1,
    text: 'Kỹ năng nào bạn mong muốn được rèn luyện sâu sắc nhất trong 4 năm đại học?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 kỹ năng bạn ưu tiên phát triển',
    options: [
      {
        id: 'q11_opt1',
        label: 'Năng lực viết lách chuyên nghiệp, sáng tạo kịch bản và dẫn dắt chiến dịch truyền thông',
        profile: { analysis: 2, communication: 5, socialHuman: 3, language: 4, creativity: 5, organization: 3, research: 3, international: 2, technologyData: 3 }
      },
      {
        id: 'q11_opt2',
        label: 'Thành thạo tối thiểu 2 ngoại ngữ và kỹ năng biên phiên dịch chuẩn xác',
        profile: { analysis: 2, communication: 4, socialHuman: 2, language: 5, creativity: 2, organization: 2, research: 3, international: 5, technologyData: 2 }
      },
      {
        id: 'q11_opt3',
        label: 'Phương pháp nghiên cứu khoa học, phân tích số liệu xã hội và tư duy biện chứng',
        profile: { analysis: 5, communication: 2, socialHuman: 3, language: 2, creativity: 1, organization: 3, research: 5, international: 2, technologyData: 4 }
      },
      {
        id: 'q11_opt4',
        label: 'Kỹ năng lắng nghe thấu cảm, tham vấn tâm lý và giải tỏa căng thẳng',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 1, creativity: 1, organization: 2, research: 4, international: 1, technologyData: 0 }
      },
      {
        id: 'q11_opt5',
        label: 'Khả năng điều hành dự án, tổ chức sự kiện quy mô lớn và giải quyết khủng hoảng',
        profile: { analysis: 3, communication: 4, socialHuman: 3, language: 2, creativity: 3, organization: 5, research: 2, international: 3, technologyData: 2 }
      },
      {
        id: 'q11_opt6',
        label: 'Kỹ năng đàm phán ngoại giao, phân tích chính sách và nghi thức lễ tân quốc tế',
        profile: { analysis: 4, communication: 4, socialHuman: 3, language: 4, creativity: 2, organization: 3, research: 4, international: 5, technologyData: 2 }
      },
    ],
  },
  {
    id: 12,
    weight: 1,
    text: 'Khi thưởng thức một tác phẩm nghệ thuật, bộ phim hoặc cuốn sách, bạn chú ý nhất đến điều gì?',
    maxSelect: 1,
    hint: 'Chọn 1 khía cạnh bạn quan tâm hàng đầu',
    options: [
      {
        id: 'q12_opt1',
        label: 'Thông điệp nhân văn, diễn biến tâm lý nhân vật và sự phát triển cảm xúc',
        profile: { analysis: 3, communication: 3, socialHuman: 5, language: 3, creativity: 3, organization: 1, research: 3, international: 2, technologyData: 0 }
      },
      {
        id: 'q12_opt2',
        label: 'Cách sử dụng ngôn từ điêu luyện, cấu trúc cốt truyện và nghệ thuật kể chuyện',
        profile: { analysis: 3, communication: 4, socialHuman: 2, language: 5, creativity: 5, organization: 1, research: 4, international: 2, technologyData: 1 }
      },
      {
        id: 'q12_opt3',
        label: 'Bối cảnh lịch sử, tính xác thực của các chi tiết thời đại và tư tưởng triết học ẩn sau',
        profile: { analysis: 4, communication: 2, socialHuman: 3, language: 3, creativity: 2, organization: 1, research: 5, international: 3, technologyData: 1 }
      },
      {
        id: 'q12_opt4',
        label: 'Kỹ xảo hình ảnh, góc máy, âm thanh và sự ứng dụng công nghệ đồ họa tiên tiến',
        profile: { analysis: 3, communication: 3, socialHuman: 1, language: 1, creativity: 5, organization: 2, research: 1, international: 2, technologyData: 5 }
      },
      {
        id: 'q12_opt5',
        label: 'Cách tác phẩm phản ánh sự giao thoa văn hóa giữa các quốc gia và dân tộc',
        profile: { analysis: 3, communication: 3, socialHuman: 3, language: 4, creativity: 3, organization: 2, research: 3, international: 5, technologyData: 1 }
      },
    ],
  },
  {
    id: 13,
    weight: 1,
    text: 'Bạn cảm thấy tự hào và trọn vẹn nhất sau khi hoàn thành loại sản phẩm nào?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 thành quả mang lại cho bạn cảm giác thành công nhất',
    options: [
      {
        id: 'q13_opt1',
        label: 'Một bài báo, video ngắn hoặc infographic có lượng tương tác cao và lan tỏa tích cực',
        profile: { analysis: 2, communication: 5, socialHuman: 3, language: 3, creativity: 5, organization: 2, research: 2, international: 2, technologyData: 4 }
      },
      {
        id: 'q13_opt2',
        label: 'Một bản dịch thuật mượt mà, lưu loát truyền tải trọn vẹn tinh thần tác phẩm gốc',
        profile: { analysis: 2, communication: 3, socialHuman: 2, language: 5, creativity: 4, organization: 2, research: 4, international: 4, technologyData: 1 }
      },
      {
        id: 'q13_opt3',
        label: 'Một bản báo cáo khoa học với lập luận chặt chẽ, trích dẫn chuẩn mực và phát hiện mới',
        profile: { analysis: 5, communication: 2, socialHuman: 2, language: 3, creativity: 1, organization: 2, research: 5, international: 2, technologyData: 3 }
      },
      {
        id: 'q13_opt4',
        label: 'Một buổi tham vấn hay hoạt động giúp đỡ một người vượt qua khủng hoảng tinh thần',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 1, creativity: 1, organization: 2, research: 3, international: 1, technologyData: 0 }
      },
      {
        id: 'q13_opt5',
        label: 'Một sự kiện hoặc chuyến đi tập thể diễn ra trọn vẹn, đúng tiến độ và an toàn',
        profile: { analysis: 2, communication: 4, socialHuman: 3, language: 2, creativity: 2, organization: 5, research: 1, international: 3, technologyData: 2 }
      },
      {
        id: 'q13_opt6',
        label: 'Một cuộc đàm phán thành công mang lại thỏa thuận hợp tác tốt đẹp giữa hai bên',
        profile: { analysis: 4, communication: 5, socialHuman: 3, language: 4, creativity: 2, organization: 4, research: 3, international: 5, technologyData: 1 }
      },
    ],
  },
  {
    id: 14,
    weight: 1,
    text: 'Xu hướng thời đại nào bạn muốn nắm bắt và đóng góp giải pháp nhất trong nghề nghiệp?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 xu hướng',
    options: [
      {
        id: 'q14_opt1',
        label: 'Sự trỗi dậy của truyền thông số, AI tạo sinh và báo chí dữ liệu',
        profile: { analysis: 4, communication: 5, socialHuman: 2, language: 2, creativity: 5, organization: 2, research: 3, international: 3, technologyData: 5 }
      },
      {
        id: 'q14_opt2',
        label: 'Bảo vệ sức khỏe tinh thần, hỗ trợ tâm lý học đường và an sinh xã hội',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 1, creativity: 2, organization: 3, research: 4, international: 1, technologyData: 1 }
      },
      {
        id: 'q14_opt3',
        label: 'Toàn cầu hóa kinh tế, ngoại giao công chúng và giao lưu văn hóa khu vực',
        profile: { analysis: 3, communication: 4, socialHuman: 2, language: 5, creativity: 2, organization: 3, research: 3, international: 5, technologyData: 2 }
      },
      {
        id: 'q14_opt4',
        label: 'Bảo tồn di sản văn hóa, phát triển công nghiệp văn hóa và du lịch bền vững',
        profile: { analysis: 3, communication: 3, socialHuman: 4, language: 3, creativity: 4, organization: 4, research: 4, international: 4, technologyData: 2 }
      },
      {
        id: 'q14_opt5',
        label: 'Phân tích bất bình đẳng xã hội, nghiên cứu chính sách công và phát triển cộng đồng',
        profile: { analysis: 5, communication: 3, socialHuman: 5, language: 2, creativity: 1, organization: 4, research: 5, international: 2, technologyData: 3 }
      },
      {
        id: 'q14_opt6',
        label: 'Nghiên cứu tư tưởng triết học, đạo đức học công nghệ và phản biện xã hội',
        profile: { analysis: 5, communication: 2, socialHuman: 3, language: 4, creativity: 2, organization: 1, research: 5, international: 3, technologyData: 2 }
      },
    ],
  },
  {
    id: 15,
    weight: 1,
    text: 'Sau 5 đến 10 năm nữa, hình mẫu nghề nghiệp nào mang lại cho bạn sự tự hào lớn nhất?',
    maxSelect: 1,
    hint: 'Chọn 1 hình mẫu bạn hướng đến nhất',
    options: [
      {
        id: 'q15_opt1',
        label: 'Nhà báo, chuyên gia truyền thông có tiếng nói ảnh hưởng tích cực đến cộng đồng',
        profile: { analysis: 3, communication: 5, socialHuman: 4, language: 4, creativity: 5, organization: 3, research: 3, international: 2, technologyData: 3 }
      },
      {
        id: 'q15_opt2',
        label: 'Nhà ngoại giao, chuyên viên đối ngoại làm việc tại các tổ chức quốc tế hoặc tập đoàn toàn cầu',
        profile: { analysis: 4, communication: 4, socialHuman: 3, language: 5, creativity: 2, organization: 3, research: 3, international: 5, technologyData: 2 }
      },
      {
        id: 'q15_opt3',
        label: 'Chuyên gia tâm lý, nhà trị liệu hoặc người phát triển các chương trình nâng đỡ tinh thần',
        profile: { analysis: 3, communication: 4, socialHuman: 5, language: 2, creativity: 2, organization: 2, research: 4, international: 1, technologyData: 0 }
      },
      {
        id: 'q15_opt4',
        label: 'Giảng viên, nhà nghiên cứu học thuật uy tín với những công trình nghiên cứu giá trị',
        profile: { analysis: 5, communication: 3, socialHuman: 2, language: 4, creativity: 2, organization: 2, research: 5, international: 3, technologyData: 2 }
      },
      {
        id: 'q15_opt5',
        label: 'Nhà quản trị du lịch, sự kiện văn hóa hoặc giám đốc vận hành doanh nghiệp dịch vụ',
        profile: { analysis: 3, communication: 4, socialHuman: 3, language: 3, creativity: 3, organization: 5, research: 1, international: 4, technologyData: 2 }
      },
      {
        id: 'q15_opt6',
        label: 'Nhà phân tích dữ liệu xã hội học hoặc chuyên viên tham mưu hoạch định chính sách công',
        profile: { analysis: 5, communication: 2, socialHuman: 4, language: 2, creativity: 1, organization: 3, research: 5, international: 2, technologyData: 5 }
      },
    ],
  },
];

const orientationProfile = (values: Partial<CriteriaProfile>): CriteriaProfile => ({
  analysis: 0,
  communication: 0,
  socialHuman: 0,
  language: 0,
  creativity: 0,
  organization: 0,
  research: 0,
  international: 0,
  technologyData: 0,
  ...values,
});

/** Câu hỏi ngắn, dựa trên hành vi và sở thích để học sinh trả lời tự nhiên. */
const LEGACY_ACTIVE_ORIENTATION_QUESTIONS: OrientationQuestion[] = [
  {
    id: 1,
    weight: 1,
    text: 'Khi có thời gian rảnh, bạn thường muốn làm gì nhất?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 hoạt động gần với bạn nhất',
    options: [
      { id: 'q1_opt1', label: 'Viết, quay hoặc làm một nội dung để chia sẻ với mọi người', profile: orientationProfile({ communication: 4, creativity: 5, technologyData: 3, language: 2 }) },
      { id: 'q1_opt2', label: 'Đọc, xem và tìm hiểu vì sao một vấn đề xảy ra', profile: orientationProfile({ analysis: 4, research: 5, socialHuman: 3 }) },
      { id: 'q1_opt3', label: 'Trò chuyện, lắng nghe hoặc giúp ai đó gỡ rối', profile: orientationProfile({ communication: 4, socialHuman: 5, organization: 2 }) },
      { id: 'q1_opt4', label: 'Tổ chức một chuyến đi hoặc hoạt động cho bạn bè', profile: orientationProfile({ organization: 5, communication: 4, socialHuman: 3 }) },
      { id: 'q1_opt5', label: 'Học thêm một ngôn ngữ và tìm hiểu cuộc sống ở nơi khác', profile: orientationProfile({ language: 5, international: 5, research: 3 }) },
      { id: 'q1_opt6', label: 'Dùng công cụ số để sắp xếp hoặc khám phá thông tin', profile: orientationProfile({ technologyData: 5, analysis: 4, creativity: 3 }) },
    ],
  },
  {
    id: 2,
    weight: 1,
    text: 'Khi làm bài tập nhóm, bạn thường thích nhận phần nào?',
    maxSelect: 1,
    hint: 'Chọn 1 vai trò bạn thấy tự nhiên nhất',
    options: [
      { id: 'q2_opt1', label: 'Nghĩ ý tưởng và trình bày cho cả nhóm', profile: orientationProfile({ communication: 5, creativity: 4, language: 3 }) },
      { id: 'q2_opt2', label: 'Tìm thông tin, so sánh các nguồn và rút ra ý chính', profile: orientationProfile({ analysis: 5, research: 5, technologyData: 3 }) },
      { id: 'q2_opt3', label: 'Chia việc, theo dõi tiến độ và kết nối các thành viên', profile: orientationProfile({ organization: 5, communication: 3, socialHuman: 3 }) },
      { id: 'q2_opt4', label: 'Tìm ví dụ, số liệu hoặc tài liệu để cả nhóm sử dụng', profile: orientationProfile({ research: 5, analysis: 4, technologyData: 3 }) },
      { id: 'q2_opt5', label: 'Thiết kế hình ảnh, slide hoặc cách trình bày sinh động', profile: orientationProfile({ creativity: 5, technologyData: 4, communication: 3 }) },
      { id: 'q2_opt6', label: 'Đặt câu hỏi và giúp nhóm nhìn vấn đề từ nhiều phía', profile: orientationProfile({ analysis: 4, socialHuman: 4, research: 4 }) },
    ],
  },
  {
    id: 3,
    weight: 1,
    text: 'Khi gặp một chủ đề mình chưa biết, bạn thường bắt đầu bằng cách nào?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 cách bạn hay làm nhất',
    options: [
      { id: 'q3_opt1', label: 'Tự tìm tài liệu rồi đọc để hiểu từ đầu đến cuối', profile: orientationProfile({ research: 5, analysis: 4, language: 2 }) },
      { id: 'q3_opt2', label: 'Hỏi người khác và trao đổi để nhìn vấn đề rõ hơn', profile: orientationProfile({ communication: 5, socialHuman: 4, international: 2 }) },
      { id: 'q3_opt3', label: 'Thử một công cụ hoặc cách làm mới để tìm câu trả lời', profile: orientationProfile({ creativity: 4, technologyData: 5, analysis: 3 }) },
      { id: 'q3_opt4', label: 'Tìm người có trải nghiệm gần với vấn đề đó để hỏi thêm', profile: orientationProfile({ communication: 4, socialHuman: 4, organization: 2 }) },
      { id: 'q3_opt5', label: 'So sánh nhiều cách giải thích trước khi chọn một cách hiểu', profile: orientationProfile({ analysis: 5, research: 4, international: 2 }) },
    ],
  },
  {
    id: 4,
    weight: 1,
    text: 'Bạn thường chú ý đến loại nội dung nào hơn?',
    maxSelect: 3,
    hint: 'Chọn tối đa 3 chủ đề bạn hay quan tâm',
    options: [
      { id: 'q4_opt1', label: 'Câu chuyện về con người, trường học và đời sống xã hội', profile: orientationProfile({ socialHuman: 5, communication: 3, research: 3 }) },
      { id: 'q4_opt2', label: 'Lịch sử, văn hóa, sách và những câu chuyện của các vùng đất', profile: orientationProfile({ research: 5, language: 4, socialHuman: 3 }) },
      { id: 'q4_opt3', label: 'Ngôn ngữ, đất nước và cách mọi người ở nơi khác sống và giao tiếp', profile: orientationProfile({ language: 5, international: 5, communication: 3 }) },
      { id: 'q4_opt4', label: 'Tin tức, truyền thông và cách một câu chuyện lan đến nhiều người', profile: orientationProfile({ communication: 5, creativity: 4, technologyData: 3 }) },
      { id: 'q4_opt5', label: 'Cách dữ liệu, công nghệ hoặc mạng xã hội đang thay đổi cuộc sống', profile: orientationProfile({ technologyData: 5, analysis: 4, research: 3 }) },
      { id: 'q4_opt6', label: 'Những nơi mới, trải nghiệm văn hóa và cách tổ chức một chuyến đi', profile: orientationProfile({ organization: 4, international: 4, communication: 4 }) },
    ],
  },
  {
    id: 5,
    weight: 1,
    text: 'Bạn thấy mình mạnh hơn ở điểm nào?',
    maxSelect: 1,
    hint: 'Chọn 1 điểm bạn tự tin nhất',
    options: [
      { id: 'q5_opt1', label: 'Viết hoặc nói sao cho người khác dễ hiểu', profile: orientationProfile({ communication: 5, language: 4, creativity: 3 }) },
      { id: 'q5_opt2', label: 'Tìm quy luật, phân tích thông tin và đặt câu hỏi', profile: orientationProfile({ analysis: 5, research: 4, technologyData: 3 }) },
      { id: 'q5_opt3', label: 'Sắp xếp công việc và xử lý tình huống phát sinh', profile: orientationProfile({ organization: 5, communication: 3, socialHuman: 3 }) },
      { id: 'q5_opt4', label: 'Lắng nghe để hiểu cảm xúc và nhu cầu của người khác', profile: orientationProfile({ socialHuman: 5, communication: 4, research: 3 }) },
    ],
  },
  {
    id: 6,
    weight: 1,
    text: 'Nếu được giao chuẩn bị một hoạt động ở trường, bạn muốn làm phần nào nhất?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 phần việc khiến bạn thấy hứng thú',
    options: [
      { id: 'q6_opt1', label: 'Lên ý tưởng, viết nội dung hoặc kể câu chuyện của hoạt động', profile: orientationProfile({ communication: 4, creativity: 5, language: 3 }) },
      { id: 'q6_opt2', label: 'Lập kế hoạch, chuẩn bị nhân sự và sắp xếp từng việc', profile: orientationProfile({ organization: 5, analysis: 3, communication: 3 }) },
      { id: 'q6_opt3', label: 'Giới thiệu hoạt động và kết nối những người tham gia', profile: orientationProfile({ communication: 5, socialHuman: 4, international: 2 }) },
      { id: 'q6_opt4', label: 'Tìm hiểu người tham gia cần gì và điều chỉnh hoạt động', profile: orientationProfile({ socialHuman: 5, analysis: 3, research: 3 }) },
      { id: 'q6_opt5', label: 'Dùng hình ảnh, video hoặc công cụ số để quảng bá', profile: orientationProfile({ creativity: 5, technologyData: 5, communication: 3 }) },
    ],
  },
  {
    id: 7,
    weight: 1,
    text: 'Khi đọc một bài viết có nhiều ý kiến khác nhau, bạn muốn làm gì?',
    maxSelect: 2,
    hint: 'Chọn tối đa 2 phản xạ gần với bạn nhất',
    options: [
      { id: 'q7_opt1', label: 'Tìm nguồn khác để kiểm tra thông tin', profile: orientationProfile({ analysis: 5, research: 5, technologyData: 2 }) },
      { id: 'q7_opt2', label: 'Đặt mình vào vị trí của từng người để hiểu họ', profile: orientationProfile({ socialHuman: 5, communication: 4, international: 2 }) },
      { id: 'q7_opt3', label: 'Nhìn lại bối cảnh và cách người viết kể câu chuyện', profile: orientationProfile({ research: 4, language: 4, creativity: 3 }) },
      { id: 'q7_opt4', label: 'Trao đổi với người khác để hiểu các góc nhìn khác nhau', profile: orientationProfile({ communication: 5, socialHuman: 4, international: 3 }) },
    ],
  },
  {
    id: 8,
    weight: 1,
    text: 'Bạn thích học theo cách nào hơn?',
    maxSelect: 1,
    hint: 'Chọn 1 cách học phù hợp với bạn',
    options: [
      { id: 'q8_opt1', label: 'Tự đọc, tự tìm ví dụ và làm theo cách của mình', profile: orientationProfile({ research: 4, analysis: 4, creativity: 3 }) },
      { id: 'q8_opt2', label: 'Trao đổi với bạn bè rồi cùng phát triển ý tưởng', profile: orientationProfile({ communication: 5, socialHuman: 4, creativity: 3 }) },
      { id: 'q8_opt3', label: 'Có kế hoạch rõ ràng và hoàn thành từng bước', profile: orientationProfile({ organization: 5, analysis: 3, research: 2 }) },
    ],
  },
  {
    id: 9,
    weight: 1,
    text: 'Hoạt động nào khiến bạn muốn tham gia lâu dài?',
    maxSelect: 1,
    hint: 'Chọn 1 hoạt động bạn thấy có ý nghĩa',
    options: [
      { id: 'q9_opt1', label: 'Làm nội dung, chụp ảnh, quay video hoặc kể chuyện', profile: orientationProfile({ creativity: 5, communication: 4, technologyData: 3 }) },
      { id: 'q9_opt2', label: 'Tìm hiểu, lưu giữ hoặc giới thiệu văn hóa và lịch sử', profile: orientationProfile({ research: 5, language: 4, socialHuman: 3 }) },
      { id: 'q9_opt3', label: 'Tổ chức hoạt động để hỗ trợ hoặc kết nối mọi người', profile: orientationProfile({ socialHuman: 5, organization: 5, communication: 4 }) },
      { id: 'q9_opt4', label: 'Tìm hiểu một địa điểm, món ăn hoặc nét văn hóa mới', profile: orientationProfile({ international: 4, research: 4, communication: 3 }) },
      { id: 'q9_opt5', label: 'Thử làm một sản phẩm số hoặc cách kể chuyện mới', profile: orientationProfile({ creativity: 5, technologyData: 4, communication: 3 }) },
    ],
  },
  {
    id: 10,
    weight: 1,
    text: 'Bạn muốn tạo ra sản phẩm nào sau một dự án?',
    maxSelect: 1,
    hint: 'Chọn 1 kết quả khiến bạn thấy vui nhất',
    options: [
      { id: 'q10_opt1', label: 'Một bài viết, video hoặc sản phẩm giúp nhiều người hiểu vấn đề hơn', profile: orientationProfile({ communication: 5, creativity: 5, socialHuman: 3 }) },
      { id: 'q10_opt2', label: 'Một bản tổng hợp thông tin rõ ràng, có dẫn chứng', profile: orientationProfile({ analysis: 5, research: 5, technologyData: 3 }) },
      { id: 'q10_opt3', label: 'Một chương trình diễn ra trọn vẹn và có ích cho người tham gia', profile: orientationProfile({ organization: 5, communication: 4, socialHuman: 4 }) },
    ],
  },
  {
    id: 11,
    weight: 1,
    text: 'Khi làm việc với người đến từ nơi khác, điều gì làm bạn hứng thú?',
    maxSelect: 1,
    hint: 'Chọn 1 điều bạn muốn khám phá',
    options: [
      { id: 'q11_opt1', label: 'Học cách họ dùng ngôn ngữ và kể về văn hóa của họ', profile: orientationProfile({ language: 5, international: 5, communication: 3 }) },
      { id: 'q11_opt2', label: 'Tìm hiểu cách các bên trao đổi và cùng giải quyết một việc', profile: orientationProfile({ international: 5, communication: 4, organization: 3, analysis: 3 }) },
      { id: 'q11_opt3', label: 'So sánh những điểm giống và khác trong cách sống', profile: orientationProfile({ research: 4, socialHuman: 4, language: 3, international: 3 }) },
    ],
  },
  {
    id: 12,
    weight: 1,
    text: 'Trong một công việc mới, bạn muốn được rèn luyện điều gì nhất?',
    maxSelect: 1,
    hint: 'Chọn 1 kỹ năng bạn muốn phát triển',
    options: [
      { id: 'q12_opt1', label: 'Viết, nói và trình bày ý tưởng thuyết phục hơn', profile: orientationProfile({ communication: 5, language: 4, creativity: 3 }) },
      { id: 'q12_opt2', label: 'Đọc hiểu, phân tích và tìm ra cách giải quyết vấn đề', profile: orientationProfile({ analysis: 5, research: 4, technologyData: 3 }) },
      { id: 'q12_opt3', label: 'Làm việc với mọi người và tổ chức công việc hiệu quả', profile: orientationProfile({ socialHuman: 4, organization: 5, communication: 4 }) },
    ],
  },
];

const surveyQuestion = (
  id: number,
  text: string,
  options: Array<[string, Partial<CriteriaProfile>]>,
): OrientationQuestion => ({
  id,
  weight: 1,
  text,
  maxSelect: 1,
  hint: 'Chọn 1 phương án gần với bạn nhất',
  options: options.map(([label, profile], index) => ({
    id: `q${id}_opt${index + 1}`,
    label,
    profile: orientationProfile(profile),
  })),
});

/** Exact 27-question cross-criterion survey used by the orientation flow. */
const ORIENTATION_QUESTION_BANK: OrientationQuestion[] = [
  surveyQuestion(1, 'Khi gặp một vấn đề có nhiều nguyên nhân, bạn thường:', [
    ['Chọn ngay cách giải quyết quen thuộc.', { analysis: 0.2, research: 0.1 }],
    ['Tìm thêm thông tin trước khi quyết định.', { analysis: 0.45, research: 0.55, technologyData: 0.2 }],
    ['Tách vấn đề thành từng phần để tìm nguyên nhân.', { analysis: 0.85, research: 0.5 }],
    ['So sánh nhiều khả năng rồi xác định nguyên nhân có cơ sở nhất.', { analysis: 1, research: 0.8, technologyData: 0.3 }],
  ]),
  surveyQuestion(2, 'Khi một bảng số liệu có nhiều thông tin khác nhau, bạn thích:', [
    ['Xem kết luận có sẵn.', { analysis: 0.15, research: 0.1 }],
    ['Tìm những con số nổi bật.', { analysis: 0.4, technologyData: 0.35 }],
    ['So sánh các nhóm số liệu.', { analysis: 0.7, technologyData: 0.6 }],
    ['Tìm mối quan hệ và xu hướng giữa các dữ liệu.', { analysis: 1, technologyData: 1, research: 0.4 }],
  ]),
  surveyQuestion(3, 'Khi hai nguồn thông tin đưa ra kết luận khác nhau, bạn thường:', [
    ['Tin nguồn mình quen thuộc hơn.', { analysis: 0.15, research: 0.1 }],
    ['Chọn thông tin dễ hiểu hơn.', { analysis: 0.25, communication: 0.2 }],
    ['Kiểm tra lại nguồn và bằng chứng.', { analysis: 0.75, research: 0.8 }],
    ['Đối chiếu dữ liệu, phương pháp và lý do để xác định thông tin đáng tin hơn.', { analysis: 1, research: 1, technologyData: 0.35 }],
  ]),
  surveyQuestion(4, 'Khi phải trình bày một ý tưởng trước nhiều người, bạn thường:', [
    ['Cảm thấy khá khó khăn.', { communication: 0.2, language: 0.2 }],
    ['Có thể trình bày nếu chuẩn bị trước.', { communication: 0.5, language: 0.45, organization: 0.25 }],
    ['Có thể trình bày và trả lời câu hỏi.', { communication: 0.8, language: 0.7, analysis: 0.25 }],
    ['Thoải mái trình bày, thuyết phục và điều chỉnh cách nói theo người nghe.', { communication: 1, language: 1, socialHuman: 0.5 }],
  ]),
  surveyQuestion(5, 'Khi một người hiểu sai ý bạn, bạn thường:', [
    ['Bỏ qua.', { communication: 0.15 }],
    ['Giải thích lại ngắn gọn.', { communication: 0.45, language: 0.4 }],
    ['Tìm cách diễn đạt dễ hiểu hơn.', { communication: 0.75, language: 0.75, socialHuman: 0.3 }],
    ['Điều chỉnh cách diễn đạt dựa trên cách người đó đang hiểu vấn đề.', { communication: 1, language: 1, socialHuman: 0.8 }],
  ]),
  surveyQuestion(6, 'Trong một nhóm làm việc, bạn thường thích:', [
    ['Làm phần việc của mình.', { organization: 0.3 }],
    ['Trao đổi khi cần.', { communication: 0.45, organization: 0.35 }],
    ['Chủ động thảo luận và chia sẻ ý kiến.', { communication: 0.75, creativity: 0.35 }],
    ['Kết nối các thành viên và giúp nhóm thống nhất cách làm.', { communication: 1, organization: 0.8, socialHuman: 0.75 }],
  ]),
  surveyQuestion(7, 'Khi thấy một người trong nhóm ít nói và có vẻ không thoải mái, bạn thường:', [
    ['Không để ý nếu họ không nói.', { socialHuman: 0.15 }],
    ['Hỏi xem họ có vấn đề gì không.', { socialHuman: 0.5, communication: 0.45 }],
    ['Tìm hiểu nguyên nhân khiến họ không thoải mái.', { socialHuman: 0.8, research: 0.35 }],
    ['Chủ động tìm cách giúp họ cảm thấy được lắng nghe và hòa nhập.', { socialHuman: 1, communication: 0.8, organization: 0.35 }],
  ]),
  surveyQuestion(8, 'Khi tìm hiểu một vấn đề xã hội, điều khiến bạn quan tâm nhất là:', [
    ['Vấn đề có ảnh hưởng đến mình hay không.', { socialHuman: 0.2 }],
    ['Có bao nhiêu người bị ảnh hưởng.', { socialHuman: 0.5, analysis: 0.35 }],
    ['Vì sao vấn đề đó xảy ra.', { socialHuman: 0.75, analysis: 0.65, research: 0.55 }],
    ['Con người bị ảnh hưởng như thế nào và xã hội có thể giải quyết ra sao.', { socialHuman: 1, analysis: 0.75, organization: 0.45, research: 0.6 }],
  ]),
  surveyQuestion(9, 'Khi làm việc với người có quan điểm rất khác mình, bạn thường:', [
    ['Giữ quan điểm của mình.', { socialHuman: 0.15, communication: 0.15 }],
    ['Nghe họ giải thích.', { communication: 0.45, socialHuman: 0.4 }],
    ['Cố gắng hiểu lý do họ suy nghĩ như vậy.', { communication: 0.7, socialHuman: 0.75 }],
    ['Đặt mình vào hoàn cảnh của họ để hiểu cả quan điểm và cảm xúc của họ.', { communication: 0.9, socialHuman: 1, international: 0.35 }],
  ]),
  surveyQuestion(10, 'Khi đọc một bài viết có cách diễn đạt hay, bạn thường:', [
    ['Chỉ quan tâm đến nội dung.', { language: 0.2 }],
    ['Nhận ra một số cách dùng từ thú vị.', { language: 0.5, creativity: 0.3 }],
    ['Chú ý đến cách tác giả lựa chọn và sắp xếp từ ngữ.', { language: 0.8, research: 0.3 }],
    ['Thường phân tích sắc thái, hình ảnh và cách ngôn ngữ tạo ra ý nghĩa.', { language: 1, creativity: 0.7, research: 0.45 }],
  ]),
  surveyQuestion(11, 'Khi gặp một từ tiếng Anh hoặc ngôn ngữ khác chưa biết, bạn thường:', [
    ['Bỏ qua.', { language: 0.15 }],
    ['Tra nghĩa.', { language: 0.45 }],
    ['Tìm thêm cách sử dụng trong câu.', { language: 0.75, research: 0.3 }],
    ['So sánh cách dùng từ trong những ngữ cảnh và văn hóa khác nhau.', { language: 1, international: 0.8, research: 0.5 }],
  ]),
  surveyQuestion(12, 'Nếu phải chuyển một đoạn văn từ ngôn ngữ này sang ngôn ngữ khác, bạn quan tâm nhất đến:', [
    ['Dịch đúng từng từ.', { language: 0.3 }],
    ['Dịch đúng nội dung.', { language: 0.55 }],
    ['Dùng cách diễn đạt tự nhiên.', { language: 0.8, communication: 0.35 }],
    ['Giữ được cả ý nghĩa, sắc thái và bối cảnh văn hóa của bản gốc.', { language: 1, international: 0.8, socialHuman: 0.3 }],
  ]),
  surveyQuestion(13, 'Khi được giao làm một sản phẩm nhưng không có mẫu cụ thể, bạn thường:', [
    ['Tìm một mẫu có sẵn để làm theo.', { creativity: 0.2, organization: 0.25 }],
    ['Thay đổi một vài chi tiết.', { creativity: 0.5 }],
    ['Nghĩ ra một cách trình bày khác.', { creativity: 0.8, communication: 0.3 }],
    ['Muốn thử một ý tưởng hoặc cách thể hiện hoàn toàn mới.', { creativity: 1, communication: 0.4, technologyData: 0.3 }],
  ]),
  surveyQuestion(14, 'Khi nhìn thấy một sản phẩm truyền thông, bạn thường chú ý đến:', [
    ['Thông tin sản phẩm.', { communication: 0.25 }],
    ['Màu sắc và hình thức.', { creativity: 0.55 }],
    ['Cách ý tưởng được thể hiện.', { creativity: 0.75, communication: 0.55 }],
    ['Ý tưởng, thông điệp và cách sản phẩm tạo ra cảm xúc cho người xem.', { creativity: 1, communication: 0.8, socialHuman: 0.5 }],
  ]),
  surveyQuestion(15, 'Khi phải nghĩ ý tưởng cho một hoạt động của trường, bạn thường:', [
    ['Dựa vào những chương trình đã từng tổ chức.', { creativity: 0.2, organization: 0.25 }],
    ['Kết hợp một vài ý tưởng quen thuộc.', { creativity: 0.5 }],
    ['Nghĩ ra một hoạt động mới phù hợp với người tham gia.', { creativity: 0.8, socialHuman: 0.55, organization: 0.35 }],
    ['Muốn tạo một concept mới và tìm cách biến nó thành trải nghiệm khác biệt.', { creativity: 1, organization: 0.5, communication: 0.45 }],
  ]),
  surveyQuestion(16, 'Khi có nhiều việc cần hoàn thành trong cùng một tuần, bạn thường:', [
    ['Làm việc nào nhớ trước.', { organization: 0.2 }],
    ['Viết danh sách các việc.', { organization: 0.45 }],
    ['Sắp xếp việc theo mức độ ưu tiên.', { organization: 0.75, analysis: 0.35 }],
    ['Lập kế hoạch theo thời gian, mức độ quan trọng và khả năng phát sinh vấn đề.', { organization: 1, analysis: 0.7 }],
  ]),
  surveyQuestion(17, 'Khi tổ chức một hoạt động có nhiều người tham gia, bạn thích:', [
    ['Phụ trách một phần việc cụ thể.', { organization: 0.3 }],
    ['Hỗ trợ các thành viên khác khi cần.', { organization: 0.5, communication: 0.35 }],
    ['Phân chia công việc và theo dõi tiến độ.', { organization: 0.8, communication: 0.45 }],
    ['Lập kế hoạch, phân công, điều phối và xử lý các vấn đề phát sinh.', { organization: 1, communication: 0.65, analysis: 0.45 }],
  ]),
  surveyQuestion(18, 'Nếu kế hoạch đang thực hiện bất ngờ gặp sự cố, bạn thường:', [
    ['Chờ người khác xử lý.', { organization: 0.15 }],
    ['Tìm một cách giải quyết tạm thời.', { organization: 0.45, analysis: 0.3 }],
    ['Điều chỉnh kế hoạch để tiếp tục.', { organization: 0.75, analysis: 0.55 }],
    ['Xác định nguyên nhân, phân bổ lại nguồn lực và điều chỉnh toàn bộ kế hoạch nếu cần.', { organization: 1, analysis: 0.85, research: 0.35 }],
  ]),
  surveyQuestion(19, 'Khi muốn tìm hiểu sâu một chủ đề, bạn thường:', [
    ['Đọc một bài viết tổng hợp.', { research: 0.25 }],
    ['Xem nhiều nguồn khác nhau.', { research: 0.55, analysis: 0.3 }],
    ['Tìm tài liệu có nguồn gốc rõ ràng.', { research: 0.8, analysis: 0.45 }],
    ['Đối chiếu nhiều tài liệu và truy tìm nguồn gốc của thông tin.', { research: 1, analysis: 0.75, language: 0.25 }],
  ]),
  surveyQuestion(20, 'Khi đọc một tài liệu dài, bạn thường:', [
    ['Đọc phần kết luận trước.', { research: 0.2 }],
    ['Đọc những phần mình quan tâm.', { research: 0.4 }],
    ['Đọc và ghi chú các ý chính.', { research: 0.75, analysis: 0.45 }],
    ['Phân tích lập luận, bằng chứng, nguồn tư liệu và cách tác giả xây dựng kết luận.', { research: 1, analysis: 0.9, language: 0.3 }],
  ]),
  surveyQuestion(21, 'Khi gặp một nhận định như “Theo một nghiên cứu, vấn đề X đang gia tăng”, bạn thường:', [
    ['Ghi nhận thông tin.', { research: 0.15 }],
    ['Tìm xem nghiên cứu đó nói gì.', { research: 0.5 }],
    ['Kiểm tra nguồn nghiên cứu.', { research: 0.8, analysis: 0.55 }],
    ['Xem phương pháp, dữ liệu, phạm vi nghiên cứu trước khi chấp nhận kết luận.', { research: 1, analysis: 1, technologyData: 0.35 }],
  ]),
  surveyQuestion(22, 'Khi tìm hiểu một vấn đề xảy ra ở một quốc gia khác, bạn thường:', [
    ['Chỉ quan tâm đến kết quả.', { international: 0.2 }],
    ['Tìm hiểu thêm tin tức.', { international: 0.5, research: 0.3 }],
    ['Tìm hiểu nguyên nhân và bối cảnh của quốc gia đó.', { international: 0.8, research: 0.65, socialHuman: 0.35 }],
    ['So sánh lịch sử, văn hóa, chính trị và lợi ích của các bên liên quan.', { international: 1, research: 0.85, analysis: 0.75, socialHuman: 0.5 }],
  ]),
  surveyQuestion(23, 'Khi hai bên có lợi ích khác nhau trong một cuộc thảo luận, bạn thường:', [
    ['Bảo vệ quan điểm của mình.', { communication: 0.25, international: 0.2 }],
    ['Tìm điểm hai bên có thể đồng ý.', { communication: 0.55, socialHuman: 0.45 }],
    ['Đề xuất phương án dung hòa lợi ích.', { communication: 0.8, organization: 0.45, international: 0.65 }],
    ['Phân tích lợi ích của từng bên và tìm phương án có thể tạo đồng thuận.', { communication: 1, organization: 0.6, international: 1, analysis: 0.6 }],
  ]),
  surveyQuestion(24, 'Bạn cảm thấy thế nào khi phải làm việc với người đến từ nền văn hóa rất khác mình?', [
    ['Khá khó thích nghi.', { international: 0.15, socialHuman: 0.2 }],
    ['Có thể làm việc nếu có hướng dẫn rõ ràng.', { international: 0.45, organization: 0.25 }],
    ['Thấy thú vị vì có cơ hội hiểu thêm về văn hóa khác.', { international: 0.75, socialHuman: 0.55 }],
    ['Chủ động tìm hiểu sự khác biệt về văn hóa và điều chỉnh cách giao tiếp cho phù hợp.', { international: 1, communication: 0.85, socialHuman: 0.75, language: 0.5 }],
  ]),
  surveyQuestion(25, 'Khi được giới thiệu một công cụ số mới, bạn thường:', [
    ['Chỉ dùng khi bắt buộc.', { technologyData: 0.15 }],
    ['Học những chức năng cơ bản.', { technologyData: 0.45 }],
    ['Tự thử thêm các chức năng khác.', { technologyData: 0.75, creativity: 0.3 }],
    ['Chủ động tìm hiểu cách công cụ có thể cải thiện công việc hoặc giải quyết vấn đề.', { technologyData: 1, analysis: 0.55, organization: 0.35 }],
  ]),
  surveyQuestion(26, 'Khi có một lượng lớn dữ liệu cần xử lý, bạn thường muốn:', [
    ['Xem một phần dữ liệu đại diện.', { technologyData: 0.2, analysis: 0.25 }],
    ['Sắp xếp dữ liệu thành bảng.', { technologyData: 0.5, organization: 0.35 }],
    ['Dùng công cụ để lọc và tìm thông tin.', { technologyData: 0.8, analysis: 0.65 }],
    ['Dùng công cụ số để làm sạch, phân tích và tìm ra xu hướng từ dữ liệu.', { technologyData: 1, analysis: 1, research: 0.45 }],
  ]),
  surveyQuestion(27, 'Khi AI hoặc một công cụ tự động đưa ra một kết quả, bạn thường:', [
    ['Sử dụng kết quả nếu có vẻ hợp lý.', { technologyData: 0.25, analysis: 0.15 }],
    ['Kiểm tra lại một vài thông tin.', { technologyData: 0.5, analysis: 0.45 }],
    ['So sánh kết quả với nguồn khác.', { technologyData: 0.75, analysis: 0.7, research: 0.55 }],
    ['Kiểm tra dữ liệu đầu vào, cách xử lý và tính hợp lý của kết quả trước khi sử dụng.', { technologyData: 1, analysis: 1, research: 0.8 }],
  ]),
];

const QUESTION_OPTION_EXTENSIONS: Record<number, OrientationOption[]> = {
  4: [
    { id: 'q4_opt5', label: 'Theo dõi cách dữ liệu và công nghệ thay đổi đời sống', profile: orientationProfile({ technologyData: 5, analysis: 4, research: 3 }) },
    { id: 'q4_opt6', label: 'Khám phá địa điểm, văn hóa và cách tổ chức một chuyến đi', profile: orientationProfile({ international: 4, organization: 4, communication: 4 }) },
  ],
  6: [
    { id: 'q6_opt6', label: 'Tìm hiểu nhu cầu người tham gia để điều chỉnh hoạt động', profile: orientationProfile({ socialHuman: 5, research: 3, organization: 3 }) },
  ],
  15: [
    { id: 'q15_opt5', label: 'Thử một hoạt động nhỏ rồi lấy phản hồi để cải tiến', profile: orientationProfile({ creativity: 4, analysis: 3, organization: 3 }) },
    { id: 'q15_opt6', label: 'Kể câu chuyện của hoạt động bằng hình ảnh hoặc video', profile: orientationProfile({ creativity: 5, communication: 4, technologyData: 3 }) },
  ],
  25: [
    { id: 'q25_opt5', label: 'Hỏi người dùng khác để học cách họ áp dụng công cụ', profile: orientationProfile({ communication: 3, technologyData: 4, socialHuman: 2 }) },
  ],
  26: [
    { id: 'q26_opt5', label: 'Hỏi người có kinh nghiệm cách sắp xếp dữ liệu', profile: orientationProfile({ communication: 3, organization: 3, technologyData: 3 }) },
    { id: 'q26_opt6', label: 'Chọn vài dữ liệu tiêu biểu để kể lại câu chuyện chính', profile: orientationProfile({ communication: 4, creativity: 3, analysis: 3 }) },
  ],
};

const ORIENTATION_QUESTION_BANK_EXTENDED = ORIENTATION_QUESTION_BANK.map((question) => ({
  ...question,
  options: [...question.options, ...(QUESTION_OPTION_EXTENSIONS[question.id] || [])],
}));

const DISTINCT_OPTION_LABELS: Record<number, string[]> = {
  1: ['Áp dụng cách từng hiệu quả trong tình huống tương tự.', 'Hỏi người có kinh nghiệm để có thêm góc nhìn.', 'Tự tìm thông tin về các nguyên nhân có thể có.', 'Thử các hướng khác nhau rồi so sánh kết quả.'],
  2: ['Đọc phần kết luận để nắm nhanh ý chính.', 'Tìm những con số nổi bật hoặc bất thường.', 'Đặt các nhóm số liệu cạnh nhau để so sánh.', 'Tìm mối liên hệ và xu hướng giữa các dữ liệu.'],
  3: ['Tin nguồn mình đã quen sử dụng.', 'Chọn cách giải thích dễ hiểu và rõ ràng hơn.', 'Mở lại nguồn và kiểm tra bằng chứng đi kèm.', 'Đối chiếu dữ liệu, cách làm và lý do của từng nguồn.'],
  4: ['Xin đổi sang phần việc phía sau hoặc hỗ trợ chuẩn bị.', 'Soạn trước ý chính rồi trình bày theo kế hoạch.', 'Trình bày và trao đổi khi người nghe đặt câu hỏi.', 'Điều chỉnh cách nói để thuyết phục từng nhóm người nghe.'],
  5: ['Để người đó tự điều chỉnh nếu hiểu nhầm không gây ảnh hưởng.', 'Nói lại ý chính bằng một cách ngắn gọn hơn.', 'Đưa ví dụ cụ thể để người đó hình dung đúng.', 'Hỏi họ đang hiểu thế nào rồi điều chỉnh cách giải thích.'],
  6: ['Nhận phần việc riêng và tự hoàn thành đúng hạn.', 'Chia sẻ tiến độ khi nhóm cần phối hợp.', 'Chủ động đưa ý tưởng và phản hồi trong thảo luận.', 'Kết nối các ý kiến để nhóm thống nhất cách làm.'],
  7: ['Chờ họ lên tiếng vì không muốn làm họ khó xử.', 'Hỏi riêng xem họ có cần hỗ trợ gì không.', 'Quan sát thêm để hiểu điều gì khiến họ không thoải mái.', 'Mời họ tham gia theo cách khiến họ cảm thấy an toàn và được lắng nghe.'],
  8: ['Xem vấn đề có liên quan trực tiếp đến mình không.', 'Tìm số người hoặc nhóm đang chịu ảnh hưởng.', 'Tìm nguyên nhân và các bên liên quan.', 'Tìm hiểu tác động lên con người rồi nghĩ cách cải thiện.'],
  9: ['Giữ quan điểm và tập trung bảo vệ lý lẽ của mình.', 'Nghe họ giải thích trước khi phản hồi.', 'Hỏi thêm để hiểu căn cứ phía sau quan điểm đó.', 'Đặt mình vào hoàn cảnh của họ để hiểu cả lý do và cảm xúc.'],
  10: ['Tập trung vào điều tác giả muốn nói.', 'Ghi nhớ những từ hoặc hình ảnh gây ấn tượng.', 'Quan sát cách câu chữ được chọn để dẫn dắt người đọc.', 'Thử giải thích sắc thái và cảm xúc mà ngôn từ tạo ra.'],
  11: ['Bỏ qua nếu từ đó không ảnh hưởng đến nội dung.', 'Tra nghĩa nhanh rồi tiếp tục đọc.', 'Tìm ví dụ để biết từ đó dùng trong câu thế nào.', 'So sánh cách dùng từ trong các bối cảnh và nền văn hóa khác nhau.'],
  12: ['Giữ cấu trúc và từ ngữ gần với bản gốc nhất.', 'Ưu tiên truyền đạt đúng thông tin chính.', 'Viết lại sao cho người đọc ngôn ngữ mới thấy tự nhiên.', 'Giữ cả sắc thái, hàm ý và bối cảnh văn hóa của bản gốc.'],
  13: ['Tìm một mẫu tương tự để bảo đảm làm đúng yêu cầu.', 'Giữ bố cục quen thuộc nhưng thay một vài chi tiết.', 'Kết hợp những ý tưởng đã biết thành cách trình bày riêng.', 'Bắt đầu từ một concept mới rồi thử biến nó thành sản phẩm.'],
  14: ['Xem sản phẩm đang cung cấp thông tin gì.', 'Chú ý màu sắc, bố cục và hình thức thể hiện.', 'Tìm xem ý tưởng được chuyển thành hình ảnh hay câu chữ ra sao.', 'Suy nghĩ về thông điệp và cảm xúc sản phẩm tạo ra cho người xem.'],
  15: ['Dựa vào một chương trình từng làm tốt để triển khai.', 'Ghép vài hoạt động quen thuộc thành một chương trình mới.', 'Thiết kế hoạt động theo nhu cầu và hoàn cảnh người tham gia.', 'Xây dựng một concept riêng rồi biến nó thành trải nghiệm khác biệt.'],
  16: ['Bắt đầu với việc chợt nhớ ra trước.', 'Ghi tất cả việc cần làm vào một danh sách.', 'Chọn việc quan trọng hoặc gấp để làm trước.', 'Lập lịch có thời hạn, thứ tự ưu tiên và thời gian dự phòng.'],
  17: ['Nhận một phần việc rõ ràng và hoàn thành nó.', 'Đứng phía sau hỗ trợ khi thành viên khác cần.', 'Chia nhiệm vụ và theo dõi tiến độ của từng phần.', 'Điều phối toàn bộ hoạt động và xử lý tình huống phát sinh.'],
  18: ['Báo người phụ trách và chờ hướng xử lý.', 'Tìm cách tạm thời để công việc không bị dừng.', 'Sắp xếp lại kế hoạch để tiếp tục phần còn lại.', 'Tìm nguyên nhân, chia lại nguồn lực và cập nhật toàn bộ kế hoạch.'],
  19: ['Đọc một bài tổng hợp để có hình dung ban đầu.', 'Xem nhiều bài viết để biết các góc nhìn khác nhau.', 'Tìm tài liệu có tác giả và nguồn xuất bản rõ ràng.', 'Lần theo nguồn gốc rồi đối chiếu các tài liệu liên quan.'],
  20: ['Đọc kết luận trước để biết tài liệu muốn nói gì.', 'Chọn những phần liên quan trực tiếp đến điều mình cần.', 'Ghi chú luận điểm chính trong khi đọc.', 'Theo dõi lập luận, bằng chứng và cách tác giả đi đến kết luận.'],
  21: ['Ghi nhận nhận định như một thông tin tham khảo.', 'Tìm đọc bản tóm tắt hoặc nội dung nghiên cứu.', 'Kiểm tra tác giả, nguồn công bố và dữ liệu được trích dẫn.', 'Xem phương pháp, mẫu dữ liệu và phạm vi trước khi tin kết luận.'],
  22: ['Chú ý kết quả cuối cùng của vấn đề.', 'Đọc thêm tin tức từ quốc gia đó.', 'Tìm hiểu nguyên nhân và bối cảnh tại địa phương.', 'So sánh lịch sử, văn hóa, chính trị và lợi ích của các bên.'],
  23: ['Trình bày rõ lý do mình không muốn thay đổi.', 'Tìm một điểm mà hai bên cùng chấp nhận.', 'Đề xuất phương án chia sẻ hoặc dung hòa lợi ích.', 'Làm rõ lợi ích từng bên rồi xây dựng phương án tạo đồng thuận.'],
  24: ['Giữ cách giao tiếp quen thuộc và chờ đối phương thích nghi.', 'Làm theo hướng dẫn hoặc quy ước đã thống nhất.', 'Chủ động hỏi về những khác biệt trong cách sống và làm việc.', 'Tìm hiểu văn hóa trước rồi điều chỉnh cách giao tiếp cho phù hợp.'],
  25: ['Chỉ mở công cụ khi công việc bắt buộc phải dùng.', 'Học các chức năng cần thiết để hoàn thành nhiệm vụ.', 'Tự thử các chức năng khác để xem công cụ làm được gì.', 'Tìm cách dùng công cụ để rút ngắn việc hoặc giải quyết vấn đề.'],
  26: ['Xem một phần dữ liệu để nắm tình hình chung.', 'Đưa dữ liệu vào bảng để dễ theo dõi.', 'Dùng bộ lọc hoặc công cụ tìm các nhóm cần quan tâm.', 'Làm sạch dữ liệu, phân tích và tìm xu hướng bằng công cụ số.'],
  27: ['Dùng kết quả nếu phù hợp với điều mình đang nghĩ.', 'Kiểm tra nhanh vài thông tin quan trọng.', 'Đối chiếu kết quả với một nguồn độc lập.', 'Kiểm tra đầu vào, cách xử lý và tính hợp lý trước khi sử dụng.'],
};

const DISTINCT_MAX_SELECTIONS: Record<number, number> = {
  4: 3,
  6: 2,
  15: 2,
  25: 2,
  26: 2,
};

const USSH_QUESTION_TEXTS: Record<number, string> = {
  1: 'Khi nhóm được giao tìm hiểu một vấn đề của sinh viên hoặc cộng đồng quanh trường, bạn thường:',
  2: 'Khi xem bảng số liệu tuyển sinh hoặc kết quả khảo sát sinh viên, bạn thích:',
  3: 'Khi hai bài viết về một vấn đề xã hội đưa ra kết luận khác nhau, bạn thường:',
  4: 'Khi phải trình bày một ý tưởng cho câu lạc bộ hoặc hoạt động sinh viên, bạn thường:',
  5: 'Khi một bạn trong nhóm hiểu sai ý tưởng bạn đề xuất cho bài tập, bạn thường:',
  6: 'Trong một bài tập nhóm về xã hội, văn hóa hoặc truyền thông, bạn thường thích:',
  7: 'Khi thấy một thành viên trong nhóm làm dự án cộng đồng ít nói và không thoải mái, bạn thường:',
  8: 'Khi tìm hiểu một vấn đề đang ảnh hưởng đến sinh viên hoặc cộng đồng, điều khiến bạn quan tâm nhất là:',
  9: 'Khi làm việc với người có góc nhìn rất khác mình trong một cuộc thảo luận, bạn thường:',
  10: 'Khi đọc một bài báo, bài giới thiệu văn hóa hoặc câu chuyện về con người, bạn thường:',
  11: 'Khi gặp một từ tiếng Anh hoặc ngôn ngữ khác trong tài liệu giao lưu quốc tế, bạn thường:',
  12: 'Nếu cần chuyển một đoạn giới thiệu về văn hóa Việt Nam sang ngôn ngữ khác, bạn quan tâm nhất đến:',
  13: 'Khi được giao làm một sản phẩm truyền thông cho hoạt động của trường nhưng không có mẫu cụ thể, bạn thường:',
  14: 'Khi xem một sản phẩm truyền thông giới thiệu ngành học, sự kiện hoặc di sản văn hóa, bạn thường chú ý đến:',
  15: 'Khi nghĩ ý tưởng cho một ngày hội sinh viên hoặc chương trình giới thiệu văn hóa, bạn thường:',
  16: 'Khi có nhiều bài tập, hoạt động câu lạc bộ và việc cá nhân trong cùng một tuần, bạn thường:',
  17: 'Khi tổ chức một tọa đàm, triển lãm hoặc hoạt động có nhiều sinh viên tham gia, bạn thích:',
  18: 'Nếu một sự kiện sinh viên hoặc dự án cộng đồng bất ngờ gặp sự cố, bạn thường:',
  19: 'Khi muốn tìm hiểu sâu một chủ đề về xã hội, lịch sử hoặc văn hóa, bạn thường:',
  20: 'Khi đọc một tài liệu dài về xã hội, chính sách hoặc lịch sử, bạn thường:',
  21: 'Khi gặp nhận định như “một nghiên cứu cho thấy sinh viên đang thay đổi thói quen”, bạn thường:',
  22: 'Khi tìm hiểu một vấn đề xảy ra ở một quốc gia khác, bạn thường:',
  23: 'Khi hai nhóm có lợi ích khác nhau trong một hoạt động hợp tác hoặc giao lưu, bạn thường:',
  24: 'Bạn cảm thấy thế nào khi làm việc với sinh viên quốc tế hoặc người có nền văn hóa rất khác mình?',
  25: 'Khi được giới thiệu một công cụ số mới để học tập, làm nội dung hoặc nghiên cứu, bạn thường:',
  26: 'Khi có một lượng lớn dữ liệu khảo sát hoặc dữ liệu tuyển sinh cần xử lý, bạn thường muốn:',
  27: 'Khi AI hoặc một công cụ tự động đưa ra kết quả về nội dung, dữ liệu hoặc nghiên cứu, bạn thường:',
};

const ORIENTATION_QUESTION_BANK_WITH_DISTINCT_LABELS = ORIENTATION_QUESTION_BANK_EXTENDED.map((question) => ({
  ...question,
  text: USSH_QUESTION_TEXTS[question.id] || question.text,
  maxSelect: DISTINCT_MAX_SELECTIONS[question.id] || question.maxSelect,
  options: question.options.map((option, index) => ({
    ...option,
    label: DISTINCT_OPTION_LABELS[question.id]?.[index] || option.label,
  })),
}));

// Group related competency signals while keeping the competency labels hidden in the UI.
const ORIENTATION_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
export const ORIENTATION_QUESTIONS: OrientationQuestion[] = ORIENTATION_DISPLAY_ORDER
  .map((id) => ORIENTATION_QUESTION_BANK_WITH_DISTINCT_LABELS.find((question) => question.id === id))
  .filter((question) => Boolean(question)) as OrientationQuestion[];

/**
 * ============================================================================
 * MAJOR PROFILES & TRỌNG SỐ CHO CÁC NGÀNH ĐÀO TẠO TẠI USSH
 * Khung đánh giá do hệ thống thiết kế phục vụ mục đích định hướng,
 * không phải tiêu chuẩn tuyển sinh chính thức của Nhà trường.
 * Điểm số profile nằm trong thang 0 - 100.
 * Trọng số weights của mỗi ngành được chuẩn hóa để tổng = 1.0 (100%).
 * ============================================================================
 */
export const MAJOR_PROFILES: MajorProfile[] = [
  {
    majorCode: '7320104',
    majorName: 'Truyền thông đa phương tiện',
    faculty: 'Khoa Báo chí và Truyền thông',
    description: 'Sản xuất nội dung số, thiết kế mỹ thuật đa phương tiện, quản trị chiến dịch truyền thông đa nền tảng và phân tích dữ liệu người xem.',
    profile: {
      analysis: 65,
      communication: 90,
      socialHuman: 65,
      language: 70,
      creativity: 95,
      organization: 75,
      research: 60,
      international: 65,
      technologyData: 90,
    },
    weights: {
      analysis: 0.08,
      communication: 0.20,
      socialHuman: 0.07,
      language: 0.08,
      creativity: 0.24,
      organization: 0.08,
      research: 0.05,
      international: 0.05,
      technologyData: 0.15,
    },
  },
  {
    majorCode: '7320101',
    majorName: 'Báo chí',
    faculty: 'Khoa Báo chí và Truyền thông',
    description: 'Phóng sự điều tra, phỏng vấn, biên tập ấn phẩm báo chí và phát thanh truyền hình, đạo đức nghề nghiệp và trách nhiệm xã hội.',
    profile: {
      analysis: 75,
      communication: 95,
      socialHuman: 85,
      language: 85,
      creativity: 80,
      organization: 70,
      research: 80,
      international: 60,
      technologyData: 65,
    },
    weights: {
      analysis: 0.12,
      communication: 0.24,
      socialHuman: 0.15,
      language: 0.16,
      creativity: 0.12,
      organization: 0.06,
      research: 0.10,
      international: 0.02,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7310206',
    majorName: 'Quan hệ quốc tế',
    faculty: 'Khoa Quan hệ Quốc tế',
    description: 'Ngoại giao song phương và đa phương, chính trị thế giới, đàm phán quốc tế, luật pháp và lễ tân ngoại giao toàn cầu.',
    profile: {
      analysis: 85,
      communication: 85,
      socialHuman: 70,
      language: 90,
      creativity: 55,
      organization: 75,
      research: 80,
      international: 98,
      technologyData: 55,
    },
    weights: {
      analysis: 0.15,
      communication: 0.14,
      socialHuman: 0.06,
      language: 0.18,
      creativity: 0.03,
      organization: 0.08,
      research: 0.11,
      international: 0.22,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7310401',
    majorName: 'Tâm lý học',
    faculty: 'Khoa Tâm lý học',
    description: 'Tham vấn tâm lý, đánh giá và trị liệu hành vi, tâm lý học nhân sự và nghiên cứu đời sống tinh thần của con người.',
    profile: {
      analysis: 75,
      communication: 85,
      socialHuman: 98,
      language: 65,
      creativity: 55,
      organization: 65,
      research: 85,
      international: 50,
      technologyData: 45,
    },
    weights: {
      analysis: 0.14,
      communication: 0.18,
      socialHuman: 0.28,
      language: 0.06,
      creativity: 0.04,
      organization: 0.06,
      research: 0.18,
      international: 0.03,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7220201',
    majorName: 'Ngôn ngữ Anh',
    faculty: 'Khoa Ngữ văn Anh',
    description: 'Biên phiên dịch học thuật và thương mại, ngôn ngữ học ứng dụng, nghiên cứu văn hóa Anh - Mỹ và kỹ năng giao tiếp chuyên sâu.',
    profile: {
      analysis: 70,
      communication: 85,
      socialHuman: 60,
      language: 98,
      creativity: 65,
      organization: 65,
      research: 75,
      international: 88,
      technologyData: 50,
    },
    weights: {
      analysis: 0.10,
      communication: 0.16,
      socialHuman: 0.04,
      language: 0.32,
      creativity: 0.05,
      organization: 0.05,
      research: 0.10,
      international: 0.15,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7310614',
    majorName: 'Hàn Quốc học',
    faculty: 'Khoa Hàn Quốc học',
    description: 'Ngôn ngữ và văn hóa Hàn Quốc, kinh tế và xã hội xứ Kim Chi, kỹ năng biên phiên dịch và tác phong doanh nghiệp Hàn Quốc.',
    profile: {
      analysis: 70,
      communication: 80,
      socialHuman: 65,
      language: 92,
      creativity: 60,
      organization: 70,
      research: 75,
      international: 90,
      technologyData: 45,
    },
    weights: {
      analysis: 0.10,
      communication: 0.14,
      socialHuman: 0.06,
      language: 0.26,
      creativity: 0.05,
      organization: 0.08,
      research: 0.10,
      international: 0.18,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7310613',
    majorName: 'Nhật Bản học',
    faculty: 'Khoa Nhật Bản học',
    description: 'Ngôn ngữ và văn hóa Nhật Bản, triết lý ứng xử Omotenashi, kinh tế - xã hội Nhật và kỹ năng làm việc với doanh nghiệp Nhật Bản.',
    profile: {
      analysis: 75,
      communication: 75,
      socialHuman: 65,
      language: 92,
      creativity: 55,
      organization: 80,
      research: 75,
      international: 90,
      technologyData: 45,
    },
    weights: {
      analysis: 0.11,
      communication: 0.12,
      socialHuman: 0.06,
      language: 0.25,
      creativity: 0.04,
      organization: 0.11,
      research: 0.11,
      international: 0.17,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7220204',
    majorName: 'Ngôn ngữ Trung Quốc',
    faculty: 'Khoa Ngôn ngữ Trung Quốc',
    description: 'Hán ngữ thương mại, văn hóa và lịch sử Trung Hoa, biên phiên dịch kinh tế đối ngoại và giao thương quốc tế.',
    profile: {
      analysis: 70,
      communication: 80,
      socialHuman: 60,
      language: 95,
      creativity: 55,
      organization: 70,
      research: 75,
      international: 85,
      technologyData: 45,
    },
    weights: {
      analysis: 0.10,
      communication: 0.15,
      socialHuman: 0.05,
      language: 0.30,
      creativity: 0.04,
      organization: 0.07,
      research: 0.11,
      international: 0.15,
      technologyData: 0.03,
    },
  },
  {
    majorCode: '7810103',
    majorName: 'Quản trị dịch vụ du lịch và lữ hành',
    faculty: 'Khoa Du lịch',
    description: 'Thiết kế và điều hành tour du lịch, quản trị khách sạn và sự kiện, nghiệp vụ hướng dẫn viên quốc tế và tiếp thị lữ hành.',
    profile: {
      analysis: 60,
      communication: 92,
      socialHuman: 75,
      language: 75,
      creativity: 70,
      organization: 95,
      research: 50,
      international: 80,
      technologyData: 55,
    },
    weights: {
      analysis: 0.08,
      communication: 0.22,
      socialHuman: 0.10,
      language: 0.12,
      creativity: 0.08,
      organization: 0.24,
      research: 0.04,
      international: 0.08,
      technologyData: 0.04,
    },
  },
  {
    majorCode: '7310301',
    majorName: 'Xã hội học',
    faculty: 'Khoa Xã hội học',
    description: 'Nghiên cứu định lượng và định tính xã hội, phân tích dữ liệu SPSS/R, đánh giá tác động chính sách công và điều tra thị trường.',
    profile: {
      analysis: 90,
      communication: 70,
      socialHuman: 90,
      language: 65,
      creativity: 50,
      organization: 70,
      research: 92,
      international: 60,
      technologyData: 80,
    },
    weights: {
      analysis: 0.22,
      communication: 0.08,
      socialHuman: 0.18,
      language: 0.05,
      creativity: 0.03,
      organization: 0.07,
      research: 0.22,
      international: 0.04,
      technologyData: 0.11,
    },
  },
  {
    majorCode: '7229030',
    majorName: 'Văn học',
    faculty: 'Khoa Văn học',
    description: 'Cảm thụ thẩm mỹ, sáng tác văn chương, biên tập ấn phẩm xuất bản, phê bình văn học và nghệ thuật sử dụng ngôn từ tiếng Việt.',
    profile: {
      analysis: 75,
      communication: 75,
      socialHuman: 75,
      language: 96,
      creativity: 90,
      organization: 55,
      research: 85,
      international: 55,
      technologyData: 40,
    },
    weights: {
      analysis: 0.11,
      communication: 0.12,
      socialHuman: 0.10,
      language: 0.28,
      creativity: 0.20,
      organization: 0.04,
      research: 0.11,
      international: 0.02,
      technologyData: 0.02,
    },
  },
  {
    majorCode: '7229010',
    majorName: 'Lịch sử',
    faculty: 'Khoa Lịch sử',
    description: 'Phương pháp sử học, phân tích văn bản cổ, bảo tồn di sản văn hóa, tư vấn bối cảnh lịch sử và lưu trữ tài liệu.',
    profile: {
      analysis: 85,
      communication: 65,
      socialHuman: 75,
      language: 75,
      creativity: 50,
      organization: 65,
      research: 96,
      international: 65,
      technologyData: 50,
    },
    weights: {
      analysis: 0.18,
      communication: 0.07,
      socialHuman: 0.12,
      language: 0.10,
      creativity: 0.03,
      organization: 0.05,
      research: 0.35,
      international: 0.06,
      technologyData: 0.04,
    },
  },
  {
    majorCode: '7760101',
    majorName: 'Công tác xã hội',
    faculty: 'Khoa Xã hội học & Công tác Xã hội',
    description: 'Hỗ trợ các nhóm yếu thế, quản lý ca xã hội, điều phối dự án an sinh cộng đồng và vận động chính sách nhân văn.',
    profile: {
      analysis: 65,
      communication: 90,
      socialHuman: 98,
      language: 60,
      creativity: 60,
      organization: 85,
      research: 70,
      international: 55,
      technologyData: 40,
    },
    weights: {
      analysis: 0.10,
      communication: 0.18,
      socialHuman: 0.32,
      language: 0.04,
      creativity: 0.05,
      organization: 0.16,
      research: 0.10,
      international: 0.03,
      technologyData: 0.02,
    },
  },
  {
    majorCode: '7229001',
    majorName: 'Triết học',
    faculty: 'Khoa Triết học',
    description: 'Phương pháp luận duy vật biện chứng, tư duy phản biện cấp cao, nghiên cứu lịch sử tư tưởng triết học và đạo đức học.',
    profile: {
      analysis: 98,
      communication: 65,
      socialHuman: 75,
      language: 75,
      creativity: 60,
      organization: 55,
      research: 98,
      international: 60,
      technologyData: 45,
    },
    weights: {
      analysis: 0.30,
      communication: 0.06,
      socialHuman: 0.09,
      language: 0.08,
      creativity: 0.04,
      organization: 0.04,
      research: 0.32,
      international: 0.05,
      technologyData: 0.02,
    },
  },
  {
    majorCode: '7140101',
    majorName: 'Giáo dục học',
    faculty: 'Khoa Giáo dục',
    description: 'Khoa học giáo dục, phát triển chương trình đào tạo, tâm lý sư phạm, phương pháp giảng dạy hiện đại và quản lý giáo dục.',
    profile: {
      analysis: 75,
      communication: 85,
      socialHuman: 90,
      language: 70,
      creativity: 70,
      organization: 85,
      research: 80,
      international: 60,
      technologyData: 60,
    },
    weights: {
      analysis: 0.12,
      communication: 0.16,
      socialHuman: 0.22,
      language: 0.08,
      creativity: 0.08,
      organization: 0.16,
      research: 0.12,
      international: 0.03,
      technologyData: 0.03,
    },
  },
];

type OrientationMajorRecord = {
  nam?: number;
  ma_nganh: string;
  ten_nganh?: string;
  he_dao_tao?: string;
};

export const normalizeOrientationMajorCode = (code: string): string => code.replace(/_(CLC|LK)$/i, '');

const equalProfile = (value: number): CriteriaProfile => ({
  analysis: value,
  communication: value,
  socialHuman: value,
  language: value,
  creativity: value,
  organization: value,
  research: value,
  international: value,
  technologyData: value,
});

const INDUSTRY_PROFILE_RULES: Array<{
  keywords: string[];
  profile: Partial<CriteriaProfile>;
  weights: Partial<CriteriaProfile>;
}> = [
  {
    keywords: ['truyền thông', 'báo chí', 'quan hệ công chúng', 'đa phương tiện'],
    profile: { communication: 88, creativity: 86, language: 76, technologyData: 72, organization: 68, analysis: 62 },
    weights: { communication: 0.22, creativity: 0.18, language: 0.12, technologyData: 0.12, organization: 0.10, analysis: 0.10 },
  },
  {
    keywords: ['ngôn ngữ', 'hàn quốc', 'nhật bản', 'trung quốc', 'đông phương'],
    profile: { language: 94, international: 84, communication: 82, research: 70, socialHuman: 62 },
    weights: { language: 0.28, international: 0.18, communication: 0.16, research: 0.10, socialHuman: 0.08 },
  },
  {
    keywords: ['quan hệ quốc tế', 'quốc tế học', 'đối ngoại', 'ngoại giao'],
    profile: { international: 95, language: 86, communication: 82, analysis: 78, research: 76, organization: 66 },
    weights: { international: 0.24, language: 0.16, communication: 0.14, analysis: 0.14, research: 0.12, organization: 0.08 },
  },
  {
    keywords: ['tâm lý', 'xã hội học', 'công tác xã hội', 'phát triển con người'],
    profile: { socialHuman: 94, research: 82, communication: 80, analysis: 76, organization: 64 },
    weights: { socialHuman: 0.28, research: 0.18, communication: 0.16, analysis: 0.14, organization: 0.08 },
  },
  {
    keywords: ['du lịch', 'lữ hành', 'khách sạn', 'quản trị dịch vụ'],
    profile: { organization: 92, communication: 86, international: 78, socialHuman: 72, language: 70, creativity: 66 },
    weights: { organization: 0.24, communication: 0.18, international: 0.14, socialHuman: 0.12, language: 0.10, creativity: 0.08 },
  },
  {
    keywords: ['lịch sử', 'văn học', 'triết học', 'hán nôm', 'văn hóa'],
    profile: { research: 94, language: 86, analysis: 82, socialHuman: 72, communication: 68 },
    weights: { research: 0.28, language: 0.18, analysis: 0.18, socialHuman: 0.10, communication: 0.08 },
  },
  {
    keywords: ['thông tin', 'thư viện', 'lưu trữ', 'bảo tàng'],
    profile: { research: 88, organization: 82, analysis: 78, technologyData: 76, communication: 62 },
    weights: { research: 0.22, organization: 0.18, analysis: 0.18, technologyData: 0.16, communication: 0.08 },
  },
  {
    keywords: ['giáo dục', 'quản lý giáo dục'],
    profile: { socialHuman: 88, communication: 84, organization: 82, research: 78, creativity: 70 },
    weights: { socialHuman: 0.22, communication: 0.18, organization: 0.18, research: 0.14, creativity: 0.10 },
  },
];

function buildDerivedMajorProfile(record: OrientationMajorRecord): MajorProfile {
  const name = `${record.ten_nganh || record.ma_nganh} ${record.he_dao_tao || ''}`.toLowerCase();
  const profile = equalProfile(50);
  const weights = equalProfile(1 / CRITERIA_KEYS.length);
  const matchedRule = INDUSTRY_PROFILE_RULES.find((rule) => rule.keywords.some((keyword) => name.includes(keyword)));

  if (matchedRule) {
    Object.entries(matchedRule.profile).forEach(([key, value]) => {
      profile[key as CriteriaKey] = value ?? profile[key as CriteriaKey];
    });
    Object.entries(matchedRule.weights).forEach(([key, value]) => {
      weights[key as CriteriaKey] = value ?? weights[key as CriteriaKey];
    });
  }

  return {
    majorCode: record.ma_nganh,
    majorName: record.ten_nganh || record.ma_nganh,
    profile,
    weights,
    description: 'Hồ sơ tiêu chí được xây dựng theo nhóm nội dung đào tạo và thông tin chương trình hiện có trong dữ liệu ngành.',
  };
}

/** Build the orientation universe from distinct Firestore major-program IDs. */
export function getOrientationMajorProfiles(records: OrientationMajorRecord[] = []): MajorProfile[] {
  const currentRecords = records.filter((record) => record.ma_nganh && (record.nam === undefined || record.nam === 2026));
  if (currentRecords.length === 0) return MAJOR_PROFILES;

  const recordsByCode = new Map<string, OrientationMajorRecord>();
  currentRecords.forEach((record) => {
    const baseCode = normalizeOrientationMajorCode(record.ma_nganh);
    const current = recordsByCode.get(baseCode);
    if (!current || record.ma_nganh === baseCode) {
      recordsByCode.set(baseCode, { ...record, ma_nganh: baseCode });
    }
  });

  const knownProfiles = new Map(MAJOR_PROFILES.map((profile) => [profile.majorCode, profile]));
  return Array.from(recordsByCode.values())
    .sort((a, b) => a.ma_nganh.localeCompare(b.ma_nganh))
    .map((record) => {
      const known = knownProfiles.get(record.ma_nganh);
      return known
        ? { ...known, majorName: record.ten_nganh || known.majorName }
        : buildDerivedMajorProfile(record);
    });
}

/**
 * ============================================================================
 * THUẬT TOÁN TÍNH TOÁN & CHUẨN HÓA HỒ SƠ NGƯỜI DÙNG
 * 
 * 1. Tính UserRaw: Tổng điểm vector 9 tiêu chí của các đáp án được chọn
 * 2. Tính UserMax: Điểm tối đa có thể đạt được cho mỗi tiêu chí dựa trên bộ câu hỏi
 * 3. Chuẩn hóa: UserScore[i] = (UserRaw[i] / UserMax[i]) * 100 (khoảng 0 - 100)
 * ============================================================================
 */

/**
 * Tính điểm trần (UserMax) lý thuyết cho 9 tiêu chí theo bộ câu hỏi và giới hạn maxSelect
 */
export function calculateTheoreticalMaxScores(questions: OrientationQuestion[]): CriteriaProfile {
  const maxScores: CriteriaProfile = {
    analysis: 0,
    communication: 0,
    socialHuman: 0,
    language: 0,
    creativity: 0,
    organization: 0,
    research: 0,
    international: 0,
    technologyData: 0,
  };

  questions.forEach((q) => {
    const maxSelect = q.maxSelect || 1;
    const questionWeight = q.weight || 1;
    CRITERIA_KEYS.forEach((key) => {
      // Sắp xếp các lựa chọn theo điểm của tiêu chí `key` giảm dần
      const sortedValues = q.options.map((opt) => opt.profile[key] || 0).sort((a, b) => b - a);
      // Lấy tổng của `maxSelect` lựa chọn cao nhất cho tiêu chí này
      const topSum = sortedValues.slice(0, maxSelect).reduce((acc, val) => acc + val, 0);
      maxScores[key] += topSum * questionWeight;
    });
  });

  return maxScores;
}

// Cache tính sẵn UserMax cho bộ câu hỏi đang được sử dụng
export const THEORETICAL_MAX_PROFILE = calculateTheoreticalMaxScores(ORIENTATION_QUESTIONS);

/**
 * Tính Hồ sơ thô và Hồ sơ chuẩn hóa của người dùng dựa trên các câu trả lời
 * answers: Record<questionId, string[] (danh sách optionId được chọn)>
 */
export function calculateUserProfile(
  answers: Record<number, string[]>,
  questions: OrientationQuestion[] = ORIENTATION_QUESTIONS
): {
  userRawProfile: CriteriaProfile;
  userMaxProfile: CriteriaProfile;
  userProfile: CriteriaProfile;
} {
  const userRawProfile: CriteriaProfile = {
    analysis: 0,
    communication: 0,
    socialHuman: 0,
    language: 0,
    creativity: 0,
    organization: 0,
    research: 0,
    international: 0,
    technologyData: 0,
  };

  // Tạo map tra cứu nhanh cho option
  const optionMap = new Map<string, OrientationQuestion['options'][0]>();
  questions.forEach((q) => {
    q.options.forEach((opt) => optionMap.set(opt.id, opt));
  });

  // Cộng dồn vector điểm của các đáp án được chọn
  Object.entries(answers).forEach(([questionId, selectedOptionIds]) => {
    const questionWeight = questions.find((question) => question.id === Number(questionId))?.weight || 1;
    const selectedOptions = selectedOptionIds
      .map((optId) => optionMap.get(optId))
      .filter((opt): opt is OrientationQuestion['options'][0] => Boolean(opt));
    if (selectedOptions.length > 0) {
      CRITERIA_KEYS.forEach((key) => {
        const averageAnswerWeight = selectedOptions.reduce((sum, opt) => sum + (opt.profile[key] || 0), 0) / selectedOptions.length;
        userRawProfile[key] += averageAnswerWeight * questionWeight;
      });
    }
  });

  const userMaxProfile = THEORETICAL_MAX_PROFILE;

  // Chuẩn hóa về thang 0 - 100 theo công thức: (UserRaw[i] / UserMax[i]) * 100
  const userProfile: CriteriaProfile = {
    analysis: 0,
    communication: 0,
    socialHuman: 0,
    language: 0,
    creativity: 0,
    organization: 0,
    research: 0,
    international: 0,
    technologyData: 0,
  };

  CRITERIA_KEYS.forEach((key) => {
    const raw = userRawProfile[key];
    const max = userMaxProfile[key] || 1;
    const normalized = Math.min(100, Math.max(0, (raw / max) * 100));
    userProfile[key] = Math.round(normalized * 10) / 10; // Giữ 1 chữ số thập phân
  });

  return { userRawProfile, userMaxProfile, userProfile };
}

/**
 * ============================================================================
 * TÍNH ĐỘ TƯƠNG ĐỒNG VÀ % PHÙ HỢP (FIT SCORE) CHO MỖI NGÀNH
 * 
 * 1. Difference[i] = |UserScore[i] - MajorScore[i]|
 * 2. Similarity[i] = calibrated(100 - Difference[i]) (khoảng 0 - 100)
 * 3. FitScore = sum(Similarity[i] * Weight[i])
 * 4. Làm tròn: Math.round(FitScore)
 * Tuyệt đối không cộng điểm ảo, không random.
 * ============================================================================
 */
export function calculateMajorFit(
  userProfile: CriteriaProfile,
  majorProfile: MajorProfile
): {
  fitScore: number;
  rawWeightedScore: number;
  criteriaBreakdown: CriterionComparison[];
  topMatchingCriteria: CriteriaKey[];
} {
  // Đảm bảo tổng trọng số được normalize về 1.0 nếu có sai lệch nhỏ
  let totalWeight = 0;
  CRITERIA_KEYS.forEach((k) => {
    totalWeight += majorProfile.weights[k] || 0;
  });
  if (totalWeight <= 0) totalWeight = 1.0;

  let weightedSum = 0;
  const criteriaBreakdown: CriterionComparison[] = [];

  CRITERIA_KEYS.forEach((key) => {
    const uScore = userProfile[key] ?? 50;
    const mScore = majorProfile.profile[key] ?? 50;
    const difference = Math.abs(uScore - mScore);
    // Previous linear calibration compressed the distribution too aggressively:
    // most majors ended up with very similar scores because a modest gap still
    // produced a high similarity value. A non-linear fit curve keeps high-match
    // criteria strong, while mismatches are penalized more sharply so the ranking
    // remains distinguishable across the full 42-major set.
    const rawGapRatio = difference / 100;
    const similarity = Math.max(0, 100 * (1 - Math.pow(rawGapRatio, 1.65)));
    const normalizedWeight = (majorProfile.weights[key] || 0) / totalWeight;
    const weightedContribution = similarity * normalizedWeight;

    weightedSum += weightedContribution;

    criteriaBreakdown.push({
      criterion: key,
      userScore: uScore,
      majorScore: mScore,
      difference: Math.round(difference * 10) / 10,
      similarity: Math.round(similarity * 10) / 10,
      weight: Math.round(normalizedWeight * 1000) / 1000,
      weightedContribution: Math.round(weightedContribution * 10) / 10,
    });
  });

  // Top matching criteria: các tiêu chí có độ tương đồng (similarity) cao nhất
  const topMatchingCriteria = [...criteriaBreakdown]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map((c) => c.criterion);

  const rawWeightedScore = weightedSum;
  const fitScore = Math.round(weightedSum);

  return {
    fitScore,
    rawWeightedScore,
    criteriaBreakdown,
    topMatchingCriteria,
  };
}

/**
 * Xếp hạng tất cả các ngành theo FitScore giảm dần
 * Giải quyết bằng điểm: Sử dụng rawWeightedScore trước khi làm tròn, sau đó đến mã ngành
 */
export function rankAllMajors(
  userProfile: CriteriaProfile,
  majorProfiles: MajorProfile[] = MAJOR_PROFILES,
  scoreRecords?: Array<{
    nam: number;
    ma_nganh: string;
    ten_nganh?: string;
    he_dao_tao?: string;
    doi_tuong?: string;
    ma_pt?: string;
    to_hop?: string | null;
    diem_chuan: number;
    thang_diem?: number;
  }>
): MajorFitResult[] {
  // Lấy thông tin tuyển sinh 2026 từ Firestore hoặc fallback bản địa
  const admissions2026Map = new Map<string, {
    methods: Set<string>;
    combinations: Set<string>;
    benchmarkSample?: number;
    maxScore?: number;
    tenNganh?: string;
  }>();

  if (scoreRecords && scoreRecords.length > 0) {
    scoreRecords.filter((r) => r.nam === 2026).forEach((r) => {
      const baseMajorCode = normalizeOrientationMajorCode(r.ma_nganh);
      if (!admissions2026Map.has(baseMajorCode)) {
        admissions2026Map.set(baseMajorCode, {
          methods: new Set(),
          combinations: new Set(),
          benchmarkSample: r.diem_chuan,
          maxScore: r.thang_diem || 100,
          tenNganh: r.ten_nganh,
        });
      }
      const info = admissions2026Map.get(baseMajorCode)!;
      if (r.ma_pt || r.doi_tuong) {
        info.methods.add(r.ma_pt || r.doi_tuong || '');
      }
      if (r.to_hop && r.to_hop !== 'all' && r.to_hop !== 'ALL') {
        info.combinations.add(r.to_hop);
      }
      if (!info.benchmarkSample || r.diem_chuan > info.benchmarkSample) {
        info.benchmarkSample = r.diem_chuan;
        info.maxScore = r.thang_diem || 100;
      }
      if (r.ten_nganh && (!info.tenNganh || r.ma_nganh === baseMajorCode)) {
        info.tenNganh = r.ten_nganh;
      }
    });
  } else {
    DETAILED_SCORE_RECORDS.filter((r) => r.year === 2026).forEach((r) => {
      const baseMajorCode = normalizeOrientationMajorCode(r.majorCode);
      if (!admissions2026Map.has(baseMajorCode)) {
        admissions2026Map.set(baseMajorCode, {
          methods: new Set(),
          combinations: new Set(),
          benchmarkSample: r.score,
          maxScore: r.maxScore,
        });
      }
      const info = admissions2026Map.get(baseMajorCode)!;
      info.methods.add(r.admissionMethod);
      info.combinations.add(r.combination);
      if (!info.benchmarkSample || r.score > info.benchmarkSample) {
        info.benchmarkSample = r.score;
        info.maxScore = r.maxScore;
      }
    });
  }

  const majorDataMap = new Map<string, Major>();
  MAJORS_DATA.forEach((m) => majorDataMap.set(m.code, m));

  const results: MajorFitResult[] = majorProfiles.map((mp) => {
    const fit = calculateMajorFit(userProfile, mp);
    const admInfo = admissions2026Map.get(mp.majorCode);
    const majorData = majorDataMap.get(mp.majorCode);

    return {
      majorCode: mp.majorCode,
      majorName: admInfo?.tenNganh || mp.majorName,
      fitScore: fit.fitScore,
      rawWeightedScore: fit.rawWeightedScore,
      rank: 0, // Sẽ gán sau khi sort
      criteriaBreakdown: fit.criteriaBreakdown,
      topMatchingCriteria: fit.topMatchingCriteria,
      majorData,
      admissions2026: admInfo ? {
        methods: Array.from(admInfo.methods).filter(Boolean),
        combinations: Array.from(admInfo.combinations),
        benchmarkSample: admInfo.benchmarkSample,
        maxScore: admInfo.maxScore,
        quotaEstimated: majorData?.quota2024,
      } : undefined,
    };
  });

  // Sort ổn định theo rawWeightedScore giảm dần, nếu bằng nhau thì sort theo mã ngành
  results.sort((a, b) => {
    if (b.rawWeightedScore !== a.rawWeightedScore) {
      return b.rawWeightedScore - a.rawWeightedScore;
    }
    return a.majorCode.localeCompare(b.majorCode);
  });

  // Gán thứ hạng
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}

/**
 * ============================================================================
 * LƯU TRỮ DRAFT VÀ LỊCH SỬ KHẢO SÁT (LOCALSTORAGE)
 * ============================================================================
 */
const STORAGE_DRAFT_KEY = 'ussh_orientation_draft_v2';
const STORAGE_HISTORY_KEY = 'ussh_orientation_history_v2';

export function saveDraftSurvey(answers: Record<number, string[]>, currentQuestionIndex: number): void {
  try {
    const data = {
      answers,
      currentQuestionIndex,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Lỗi khi lưu draft khảo sát:', err);
  }
}

export function loadDraftSurvey(): { answers: Record<number, string[]>; currentQuestionIndex: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.answers) {
      return {
        answers: parsed.answers,
        currentQuestionIndex: typeof parsed.currentQuestionIndex === 'number' ? parsed.currentQuestionIndex : 0,
      };
    }
  } catch (err) {
    console.error('Lỗi khi tải draft khảo sát:', err);
  }
  return null;
}

export function clearDraftSurvey(): void {
  try {
    localStorage.removeItem(STORAGE_DRAFT_KEY);
  } catch (err) {
    console.error('Lỗi khi xóa draft khảo sát:', err);
  }
}

export function saveSurveyHistory(
  answers: Record<number, string[]>,
  userRawProfile: CriteriaProfile,
  userProfile: CriteriaProfile,
  top3Majors: MajorFitResult[]
): void {
  try {
    const historyItem: OrientationHistoryItem = {
      id: `survey_${Date.now()}`,
      completedAt: new Date().toISOString(),
      answers,
      userRawProfile,
      userProfile,
      top3Majors,
    };
    const current = loadSurveyHistory();
    const nextHistory = [historyItem, ...current].slice(0, 10); // Giữ tối đa 10 lần gần nhất
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(nextHistory));
  } catch (err) {
    console.error('Lỗi khi lưu lịch sử khảo sát:', err);
  }
}

export function loadSurveyHistory(): OrientationHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Lỗi khi tải lịch sử khảo sát:', err);
  }
  return [];
}

export function clearSurveyHistory(): void {
  try {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  } catch (err) {
    console.error('Lỗi khi xóa lịch sử khảo sát:', err);
  }
}

export function deleteSurveyHistoryItem(historyId: string): void {
  try {
    const nextHistory = loadSurveyHistory().filter((item) => item.id !== historyId);
    if (nextHistory.length === 0) {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
      return;
    }
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(nextHistory));
  } catch (err) {
    console.error('Lỗi khi xóa một lịch sử khảo sát:', err);
  }
}
