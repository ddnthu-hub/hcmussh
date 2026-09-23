import { Major, SubjectCombination, AdmissionMethodDetail } from '../types';

export const SUBJECT_COMBINATIONS: SubjectCombination[] = [
  { code: 'D01', name: 'Toán, Ngữ văn, Tiếng Anh', subjects: ['Toán', 'Ngữ văn', 'Tiếng Anh'] },
  { code: 'C00', name: 'Ngữ văn, Lịch sử, Địa lí', subjects: ['Ngữ văn', 'Lịch sử', 'Địa lí'] },
  { code: 'D14', name: 'Ngữ văn, Lịch sử, Tiếng Anh', subjects: ['Ngữ văn', 'Lịch sử', 'Tiếng Anh'] },
  { code: 'D15', name: 'Ngữ văn, Địa lí, Tiếng Anh', subjects: ['Ngữ văn', 'Địa lí', 'Tiếng Anh'] },
  { code: 'A01', name: 'Toán, Vật lí, Tiếng Anh', subjects: ['Toán', 'Vật lí', 'Tiếng Anh'] },
  { code: 'D04', name: 'Toán, Ngữ văn, Tiếng Trung', subjects: ['Toán', 'Ngữ văn', 'Tiếng Trung'] },
  { code: 'D06', name: 'Toán, Ngữ văn, Tiếng Nhật', subjects: ['Toán', 'Ngữ văn', 'Tiếng Nhật'] },
];

export const MAJORS_DATA: Major[] = [
  {
    id: '7320104',
    code: '7320104',
    name: 'Truyền thông đa phương tiện',
    faculty: 'Khoa Báo chí và Truyền thông',
    fieldCategory: 'communication',
    fieldCategoryName: 'Báo chí & Truyền thông',
    programType: 'Chuẩn',
    description: 'Đào tạo cử nhân làm chủ tư duy sáng tạo nội dung, sản xuất video, đồ họa số, quản trị chiến dịch truyền thông đa nền tảng trong kỷ nguyên số.',
    targetSkills: ['Sản xuất video & đồ họa số', 'Xây dựng chiến lược nội dung số', 'Phân tích dữ liệu người xem', 'Kể chuyện đa phương tiện (Transmedia)'],
    careerProspects: ['Chuyên viên sáng tạo nội dung số (Content Creator)', 'Chuyên viên tổ chức sự kiện & truyền thông đối ngoại', 'Đạo diễn hình ảnh, dựng phim và quản trị kênh số', 'Giám đốc truyền thông doanh nghiệp'],
    sampleEmployers: ['VTV, HTV, VnExpress, Dentsu, Ogilvy, Shopee, MoMo, VNG'],
    defaultCombinations: ['D01', 'D14', 'D15'],
    quota2024: 120,
    tuitionEstimatedPerYear: '28.000.000 - 32.000.000 VNĐ',
    highlight: true,
    benchmarkHistory: [
      { year: 2024, thptScore: 27.50, dgnlScore: 890, combinations: ['D01', 'D14', 'D15'] },
      { year: 2023, thptScore: 27.25, dgnlScore: 880, combinations: ['D01', 'D14', 'D15'] },
      { year: 2022, thptScore: 27.00, dgnlScore: 865, combinations: ['D01', 'D14', 'D15'] },
    ],
  },
  {
    id: '7320101',
    code: '7320101',
    name: 'Báo chí',
    faculty: 'Khoa Báo chí và Truyền thông',
    fieldCategory: 'communication',
    fieldCategoryName: 'Báo chí & Truyền thông',
    programType: 'Chuẩn',
    description: 'Chiếc nôi đào tạo phóng viên, biên tập viên, nhà báo chuyên nghiệp hàng đầu phía Nam với bề dày hơn 30 năm uy tín học thuật và thực hành.',
    targetSkills: ['Kỹ năng phỏng vấn, điều tra & viết bài báo chí', 'Biên tập bản tin phát thanh - truyền hình', 'Ứng dụng AI & dữ liệu trong làm báo (Data Journalism)', 'Đạo đức nghề nghiệp và pháp luật báo chí'],
    careerProspects: ['Phóng viên, nhà báo tại các cơ quan thông tấn báo chí', 'Biên tập viên truyền hình, phát thanh', 'Chuyên viên quan hệ báo chí & phát ngôn viên (PR Officer)', 'Nghiên cứu viên và giảng viên truyền thông'],
    sampleEmployers: ['Báo Tuổi Trẻ, Thanh Niên, Đài Tiếng nói Nhân dân TP.HCM (VOH), HTV, VTV9'],
    defaultCombinations: ['C00', 'D01', 'D14'],
    quota2024: 150,
    tuitionEstimatedPerYear: '26.000.000 - 29.000.000 VNĐ',
    highlight: true,
    benchmarkHistory: [
      { year: 2024, thptScore: 27.80, dgnlScore: 875, combinations: ['C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 27.50, dgnlScore: 860, combinations: ['C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 27.20, dgnlScore: 840, combinations: ['C00', 'D01', 'D14'] },
    ],
  },
  {
    id: '7310206',
    code: '7310206',
    name: 'Quan hệ quốc tế',
    faculty: 'Khoa Quan hệ Quốc tế',
    fieldCategory: 'international',
    fieldCategoryName: 'Ngoại giao & Quốc tế',
    programType: 'Chuẩn',
    description: 'Trang bị kiến thức chuyên sâu về ngoại giao, chính trị thế giới, luật quốc tế, đàm phán thương mại và kỹ năng hội nhập toàn cầu.',
    targetSkills: ['Kỹ năng đàm phán & ngoại giao đa văn hóa', 'Nghiên cứu & phân tích chính sách đối ngoại', 'Tiếng Anh chuyên ngành chính trị & kinh tế', 'Nghi thức lễ tân quốc tế'],
    careerProspects: ['Cán bộ ngoại giao tại Bộ Ngoại giao, Sở Ngoại vụ', 'Chuyên viên đối ngoại các tổ chức phi chính phủ (NGO)', 'Chuyên viên xúc tiến thương mại quốc tế', 'Quản lý dự án quốc tế'],
    sampleEmployers: ['Bộ Ngoại giao, Lãnh sự quán các nước, UNDP, UNICEF, AmCham, EuroCham'],
    defaultCombinations: ['D01', 'D14'],
    quota2024: 140,
    tuitionEstimatedPerYear: '28.000.000 - 32.000.000 VNĐ',
    highlight: true,
    benchmarkHistory: [
      { year: 2024, thptScore: 26.90, dgnlScore: 865, combinations: ['D01', 'D14'] },
      { year: 2023, thptScore: 26.80, dgnlScore: 855, combinations: ['D01', 'D14'] },
      { year: 2022, thptScore: 26.50, dgnlScore: 845, combinations: ['D01', 'D14'] },
    ],
  },
  {
    id: '7310401',
    code: '7310401',
    name: 'Tâm lý học',
    faculty: 'Khoa Tâm lý học',
    fieldCategory: 'social_science',
    fieldCategoryName: 'Khoa học Xã hội',
    programType: 'Chuẩn',
    description: 'Khoa Tâm lý học uy tín bậc nhất, chuyên sâu về tham vấn tâm lý, tâm lý học trường học, tâm lý trị liệu và tâm lý học nhân sự tổ chức.',
    targetSkills: ['Đánh giá & trắc nghiệm tâm lý', 'Kỹ năng lắng nghe thấu cảm & tham vấn', 'Nghiên cứu hành vi con người', 'Thiết kế chương trình chăm sóc sức khỏe tinh thần'],
    careerProspects: ['Chuyên viên tham vấn học đường & trung tâm trị liệu', 'Chuyên gia nhân sự & đào tạo (HR & L&D)', 'Nghiên cứu viên hành vi tiêu dùng thị trường', 'Trị liệu tâm lý dưới sự giám sát'],
    sampleEmployers: ['Bệnh viện Nhi Đồng, Vinschool, FPT Software, Unilever, Viện Sức khỏe Tâm thần'],
    defaultCombinations: ['B00', 'C00', 'D01', 'D14'],
    quota2024: 160,
    tuitionEstimatedPerYear: '25.000.000 - 28.000.000 VNĐ',
    highlight: true,
    benchmarkHistory: [
      { year: 2024, thptScore: 27.00, dgnlScore: 860, combinations: ['C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 26.75, dgnlScore: 845, combinations: ['C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 26.30, dgnlScore: 830, combinations: ['C00', 'D01', 'D14'] },
    ],
  },
  {
    id: '7220201',
    code: '7220201',
    name: 'Ngôn ngữ Anh',
    faculty: 'Khoa Ngữ văn Anh',
    fieldCategory: 'language',
    fieldCategoryName: 'Ngôn ngữ & Văn hóa',
    programType: 'Chuẩn',
    description: 'Chương trình đào tạo ngôn ngữ chuẩn học thuật, nghiên cứu văn hóa, biên phiên dịch cấp cao và giảng dạy tiếng Anh phương pháp hiện đại.',
    targetSkills: ['Biên phiên dịch hội nghị & văn bản chuyên ngành', 'Phân tích văn học & văn hóa Anh - Mỹ', 'Năng lực hùng biện & viết luận học thuật', 'Phương pháp giảng dạy TESOL'],
    careerProspects: ['Biên dịch viên, phiên dịch viên cabin cao cấp', 'Giảng viên, giáo viên tiếng Anh tại trường đại học, tổ chức giáo dục', 'Chuyên viên truyền thông quốc tế', 'Chuyên viên xuất bản & bản quyền sách'],
    sampleEmployers: ['British Council, ILA, VUS, Nhà xuất bản Trẻ, Các tập đoàn đa quốc gia'],
    defaultCombinations: ['D01', 'D14'],
    quota2024: 250,
    tuitionEstimatedPerYear: '30.000.000 - 34.000.000 VNĐ',
    highlight: true,
    benchmarkHistory: [
      { year: 2024, thptScore: 26.65, dgnlScore: 855, combinations: ['D01', 'D14'] },
      { year: 2023, thptScore: 26.40, dgnlScore: 845, combinations: ['D01', 'D14'] },
      { year: 2022, thptScore: 26.20, dgnlScore: 835, combinations: ['D01', 'D14'] },
    ],
  },
  {
    id: '7310614',
    code: '7310614',
    name: 'Hàn Quốc học',
    faculty: 'Khoa Hàn Quốc học',
    fieldCategory: 'international',
    fieldCategoryName: 'Ngoại giao & Quốc tế',
    programType: 'Chuẩn',
    description: 'Trung tâm nghiên cứu và giảng dạy tiếng Hàn, văn hóa, kinh tế và xã hội Hàn Quốc hàng đầu Việt Nam với liên kết sâu rộng cùng đối tác Hàn Quốc.',
    targetSkills: ['Thành thạo tiếng Hàn TOPIK 5-6', 'Hiểu biết sâu sắc về văn hóa doanh nghiệp Hàn', 'Kỹ năng biên phiên dịch song ngữ Hàn - Việt', 'Quản trị hành chính văn phòng quốc tế'],
    careerProspects: ['Biên phiên dịch viên tại các tập đoàn Hàn Quốc', 'Trợ lý ban giám đốc, nhân sự, thu mua (Procurement)', 'Điều phối viên giao lưu văn hóa Việt - Hàn', 'Nghiên cứu viên khu vực học'],
    sampleEmployers: ['Samsung Vietnam, CJ Group, Lotte, LG Electronics, Shinhan Bank'],
    defaultCombinations: ['D01', 'D14', 'D15'],
    quota2024: 150,
    tuitionEstimatedPerYear: '26.000.000 - 30.000.000 VNĐ',
    highlight: true,
    benchmarkHistory: [
      { year: 2024, thptScore: 27.20, dgnlScore: 860, combinations: ['D01', 'D14', 'D15'] },
      { year: 2023, thptScore: 27.00, dgnlScore: 850, combinations: ['D01', 'D14', 'D15'] },
      { year: 2022, thptScore: 26.85, dgnlScore: 840, combinations: ['D01', 'D14', 'D15'] },
    ],
  },
  {
    id: '7310613',
    code: '7310613',
    name: 'Nhật Bản học',
    faculty: 'Khoa Nhật Bản học',
    fieldCategory: 'international',
    fieldCategoryName: 'Ngoại giao & Quốc tế',
    programType: 'Chuẩn',
    description: 'Chương trình đào tạo chuyên sâu về ngôn ngữ, tư tưởng, phong cách làm việc của người Nhật và quan hệ kinh tế văn hóa Việt Nam - Nhật Bản.',
    targetSkills: ['Tiếng Nhật đạt trình độ JLPT N2 - N1', 'Kỹ năng giao tiếp và ứng xử chuẩn mực Omotenashi', 'Kỹ năng biên phiên dịch và đàm phán thương mại', 'Nghiên cứu kinh tế xã hội Nhật'],
    careerProspects: ['Biên phiên dịch viên & trợ lý lãnh đạo công ty Nhật', 'Kỹ sư cầu nối văn hóa (Bridge SE coordinator)', 'Chuyên viên tư vấn xúc tiến đầu tư Nhật Bản', 'Giảng viên tiếng Nhật'],
    sampleEmployers: ['Aeon Mall, Daikin, Toyota, Panasonic, JETRO, JICA'],
    defaultCombinations: ['D01', 'D06', 'D14'],
    quota2024: 140,
    tuitionEstimatedPerYear: '26.000.000 - 30.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 26.30, dgnlScore: 840, combinations: ['D01', 'D06', 'D14'] },
      { year: 2023, thptScore: 26.10, dgnlScore: 830, combinations: ['D01', 'D06', 'D14'] },
      { year: 2022, thptScore: 25.80, dgnlScore: 820, combinations: ['D01', 'D06', 'D14'] },
    ],
  },
  {
    id: '7810103',
    code: '7810103',
    name: 'Quản trị dịch vụ du lịch và lữ hành',
    faculty: 'Khoa Du lịch',
    fieldCategory: 'tourism',
    fieldCategoryName: 'Du lịch & Dịch vụ',
    programType: 'Chuẩn',
    description: 'Đào tạo nhà quản trị lữ hành năng động, am hiểu tài nguyên du lịch, thiết kế tour trải nghiệm bền vững và tổ chức sự kiện chuyên nghiệp.',
    targetSkills: ['Hoạch định tour & thiết kế hành trình du lịch', 'Nghiệp vụ hướng dẫn viên quốc tế', 'Quản trị vận hành khách sạn & sự kiện (MICE)', 'Tiếp thị số trong ngành du lịch'],
    careerProspects: ['Giám đốc điều hành tour du lịch lữ hành', 'Chuyên viên phát triển sản phẩm du lịch', 'Hướng dẫn viên du lịch quốc tế', 'Quản lý marketing dịch vụ hiếu khách (Hospitality)'],
    sampleEmployers: ['Saigontourist, Vietravel, BenThanh Tourist, Khách sạn Caravelle, Vinpearl'],
    defaultCombinations: ['C00', 'D01', 'D14', 'D15'],
    quota2024: 130,
    tuitionEstimatedPerYear: '28.000.000 - 32.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 26.20, dgnlScore: 835, combinations: ['C00', 'D01', 'D14', 'D15'] },
      { year: 2023, thptScore: 26.00, dgnlScore: 825, combinations: ['C00', 'D01', 'D14', 'D15'] },
      { year: 2022, thptScore: 25.60, dgnlScore: 810, combinations: ['C00', 'D01', 'D14', 'D15'] },
    ],
  },
  {
    id: '7310301',
    code: '7310301',
    name: 'Xã hội học',
    faculty: 'Khoa Xã hội học',
    fieldCategory: 'social_science',
    fieldCategoryName: 'Khoa học Xã hội',
    programType: 'Chuẩn',
    description: 'Trang bị phương pháp nghiên cứu xã hội, phân tích chính sách công, nghiên cứu thị trường và đánh giá tác động xã hội.',
    targetSkills: ['Nghiên cứu định lượng & định tính xã hội học', 'Phân tích số liệu SPSS, R, Python', 'Đánh giá tác động dự án phát triển cộng đồng', 'Thăm dò dư luận xã hội'],
    careerProspects: ['Chuyên viên nghiên cứu thị trường (Market Research Analyst)', 'Cán bộ phát triển cộng đồng tại các NGO', 'Chuyên viên phân tích chính sách xã hội', 'Phóng viên xã hội và điều tra'],
    sampleEmployers: ['NielsenIQ, Kantar Vietnam, Viện Nghiên cứu Phát triển TP.HCM, Oxfam, WWF'],
    defaultCombinations: ['A01', 'C00', 'D01', 'D14'],
    quota2024: 120,
    tuitionEstimatedPerYear: '24.000.000 - 27.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 25.10, dgnlScore: 780, combinations: ['A01', 'C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 24.80, dgnlScore: 765, combinations: ['A01', 'C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 24.40, dgnlScore: 750, combinations: ['A01', 'C00', 'D01', 'D14'] },
    ],
  },
  {
    id: '7229030',
    code: '7229030',
    name: 'Văn học',
    faculty: 'Khoa Văn học',
    fieldCategory: 'humanities',
    fieldCategoryName: 'Nhân văn & Nghệ thuật',
    programType: 'Chuẩn',
    description: 'Khoa Văn học giàu truyền thống bậc nhất, đào tạo năng lực cảm thụ thẩm mỹ, phê bình, tư duy ngôn từ sắc sảo và nghệ thuật sáng tác.',
    targetSkills: ['Phân tích & phê bình văn học', 'Kỹ năng viết văn bản học thuật & sáng tạo', 'Biên tập ấn phẩm xuất bản', 'Ứng dụng văn học trong kịch bản & phim ảnh'],
    careerProspects: ['Biên tập viên nhà xuất bản, tạp chí', 'Nhà biên kịch, Copywriter, tác giả sách', 'Giáo viên Ngữ văn các trường THPT', 'Chuyên viên truyền thông nội bộ'],
    sampleEmployers: ['NXB Kim Đồng, NXB Trẻ, Galaxy Studio, Các trường THPT chuyên Lê Hồng Phong, Trần Đại Nghĩa'],
    defaultCombinations: ['C00', 'D01', 'D14'],
    quota2024: 140,
    tuitionEstimatedPerYear: '24.000.000 - 26.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 25.80, dgnlScore: 805, combinations: ['C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 25.40, dgnlScore: 790, combinations: ['C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 25.00, dgnlScore: 780, combinations: ['C00', 'D01', 'D14'] },
    ],
  },
  {
    id: '7229010',
    code: '7229010',
    name: 'Lịch sử',
    faculty: 'Khoa Lịch sử',
    fieldCategory: 'humanities',
    fieldCategoryName: 'Nhân văn & Nghệ thuật',
    programType: 'Chuẩn',
    description: 'Nghiên cứu tiến trình lịch sử dân tộc và thế giới, bảo tồn di sản văn hóa, khảo cổ học và quản trị văn hóa lịch sử.',
    targetSkills: ['Phương pháp sử học & phân tích văn bản cổ', 'Bảo tồn & số hóa di sản văn hóa', 'Tư vấn nội dung văn hóa lịch sử cho phim, triển lãm', 'Tư duy phản biện biện chứng'],
    careerProspects: ['Cán bộ quản lý tại bảo tàng, khu di tích lịch sử', 'Chuyên viên tư vấn văn hóa di sản', 'Giảng viên, giáo viên Lịch sử', 'Chuyên viên lưu trữ và nghiên cứu viện hàn lâm'],
    sampleEmployers: ['Bảo tàng Chứng tích Chiến tranh, Bảo tàng Lịch sử TP.HCM, Sở Văn hóa & Thể thao TP.HCM'],
    defaultCombinations: ['C00', 'D01', 'D14'],
    quota2024: 100,
    tuitionEstimatedPerYear: '24.000.000 - 26.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 24.50, dgnlScore: 760, combinations: ['C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 24.20, dgnlScore: 745, combinations: ['C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 23.80, dgnlScore: 730, combinations: ['C00', 'D01', 'D14'] },
    ],
  },
  {
    id: '7220204',
    code: '7220204',
    name: 'Ngôn ngữ Trung Quốc',
    faculty: 'Khoa Ngôn ngữ Trung Quốc',
    fieldCategory: 'language',
    fieldCategoryName: 'Ngôn ngữ & Văn hóa',
    programType: 'Chuẩn',
    description: 'Đào tạo cử nhân thành thạo Hán ngữ thương mại, văn hóa Trung Hoa, kỹ năng biên phiên dịch đối ngoại và giao thương quốc tế.',
    targetSkills: ['Thành thạo HSK 5-6, HSKK cao cấp', 'Biên phiên dịch thương mại Trung - Việt', 'Am hiểu luật thương mại và thị trường Hoa ngữ', 'Kỹ năng đàm phán hợp đồng'],
    careerProspects: ['Chuyên viên xuất nhập khẩu với thị trường Trung Quốc, Đài Loan', 'Biên phiên dịch viên đối ngoại', 'Quản lý chuỗi cung ứng doanh nghiệp FDI', 'Giáo viên tiếng Trung'],
    sampleEmployers: ['Foxconn, Texhong, Haier, Công ty Logistics Quốc tế, Các trường đại học'],
    defaultCombinations: ['D01', 'D04', 'D14'],
    quota2024: 160,
    tuitionEstimatedPerYear: '27.000.000 - 30.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 26.50, dgnlScore: 845, combinations: ['D01', 'D04', 'D14'] },
      { year: 2023, thptScore: 26.25, dgnlScore: 830, combinations: ['D01', 'D04', 'D14'] },
      { year: 2022, thptScore: 25.90, dgnlScore: 815, combinations: ['D01', 'D04', 'D14'] },
    ],
  },
  {
    id: '7760101',
    code: '7760101',
    name: 'Công tác xã hội',
    faculty: 'Khoa Xã hội học & Công tác Xã hội',
    fieldCategory: 'social_science',
    fieldCategoryName: 'Khoa học Xã hội',
    programType: 'Chuẩn',
    description: 'Đào tạo nhân lực hỗ trợ các nhóm yếu thế, quản lý dự án an sinh xã hội, bảo vệ trẻ em và phát triển cộng đồng nhân ái.',
    targetSkills: ['Kỹ năng can thiệp khủng hoảng & tham vấn cá nhân', 'Phát triển dự án an sinh & từ thiện minh bạch', 'Quản lý trường hợp (Case management)', 'Vận động chính sách xã hội'],
    careerProspects: ['Nhân viên xã hội tại bệnh viện (Medical Social Worker)', 'Điều phối viên chương trình tại tổ chức phi chính phủ (NGO)', 'Cán bộ phòng Lao động - Thương binh & Xã hội', 'Chuyên viên CSR doanh nghiệp'],
    sampleEmployers: ['Bệnh viện Chợ Rẫy, Tổ chức Trẻ em Rồng Xanh (Blue Dragon), World Vision, Save the Children'],
    defaultCombinations: ['C00', 'D01', 'D14'],
    quota2024: 110,
    tuitionEstimatedPerYear: '23.000.000 - 25.000.000 VNĐ',
    benchmarkHistory: [
      { year: 2024, thptScore: 24.00, dgnlScore: 740, combinations: ['C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 23.75, dgnlScore: 725, combinations: ['C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 23.20, dgnlScore: 710, combinations: ['C00', 'D01', 'D14'] },
    ],
  },
  {
    id: '7229001',
    code: '7229001',
    name: 'Triết học',
    faculty: 'Khoa Triết học',
    fieldCategory: 'humanities',
    fieldCategoryName: 'Nhân văn & Nghệ thuật',
    programType: 'Chuẩn',
    description: 'Nền tảng tư duy phản biện đỉnh cao, phương pháp luận khoa học, nghiên cứu tư tưởng phương Đông và phương Tây, đạo đức học kinh doanh.',
    targetSkills: ['Tư duy phản biện và suy luận logic cấp cao', 'Phân tích hệ giá trị và văn hóa doanh nghiệp', 'Kỹ năng hùng biện, viết luận học thuật sắc sảo', 'Phương pháp luận nghiên cứu xã hội'],
    careerProspects: ['Chuyên viên hoạch định chính sách tại các cơ quan nhà nước', 'Giảng viên giảng dạy các môn lý luận chính trị', 'Chuyên viên đào tạo tư duy & văn hóa doanh nghiệp', 'Biên tập viên sách lý luận, chính trị - xã hội'],
    sampleEmployers: ['Học viện Chính trị Quốc gia, Các trường Đại học tại TP.HCM, Ban Tuyên giáo, NXB Chính trị Quốc gia'],
    defaultCombinations: ['A01', 'C00', 'D01', 'D14'],
    quota2024: 90,
    tuitionEstimatedPerYear: '22.000.000 - 24.000.000 VNĐ (Được hưởng chính sách hỗ trợ ngành khoa học cơ bản)',
    benchmarkHistory: [
      { year: 2024, thptScore: 22.50, dgnlScore: 710, combinations: ['A01', 'C00', 'D01', 'D14'] },
      { year: 2023, thptScore: 22.00, dgnlScore: 690, combinations: ['A01', 'C00', 'D01', 'D14'] },
      { year: 2022, thptScore: 21.50, dgnlScore: 680, combinations: ['A01', 'C00', 'D01', 'D14'] },
    ],
  },
];

export const ADMISSION_METHODS: AdmissionMethodDetail[] = [
  {
    id: 'PT1_THPT',
    name: 'Phương thức 1: Xét tuyển dựa trên kết quả thi Tốt nghiệp THPT',
    shortName: 'Thi tốt nghiệp THPT',
    codeName: 'Phương thức 100',
    quotaShare: '45 - 55% tổng chỉ tiêu',
    description: 'Phương thức xét tuyển truyền thống căn cứ vào tổng điểm 3 môn thi THPT theo tổ hợp xét tuyển cộng với điểm ưu tiên đối tượng, khu vực theo quy chế của Bộ GD&ĐT.',
    badgeColor: 'blue',
    requirements: [
      'Đã tốt nghiệp THPT hoặc tương đương',
      'Đạt ngưỡng đảm bảo chất lượng đầu vào (điểm sàn) do Trường công bố sau khi có điểm thi THPT',
      'Không có môn thi nào trong tổ hợp xét tuyển bị điểm liệt (từ 1.0 điểm trở xuống)',
    ],
    timeframe: 'Tháng 7 - Tháng 8 hàng năm (Theo lịch của Bộ Giáo dục & Đào tạo)',
    steps: [
      'Tham dự kỳ thi Tốt nghiệp THPT và nhận kết quả chính thức',
      'Đăng ký và điều chỉnh nguyện vọng trực tuyến trên Cổng tuyển sinh của Bộ GD&ĐT',
      'Trường thực hiện lọc ảo toàn quốc và công bố điểm chuẩn trúng tuyển',
      'Xác nhận nhập học trực tuyến và làm thủ tục nhập học tại trường',
    ],
  },
  {
    id: 'PT2_DGNL',
    name: 'Phương thức 2: Xét tuyển kết quả thi Đánh giá năng lực ĐHQG-HCM',
    shortName: 'ĐGNL ĐHQG-HCM',
    codeName: 'Phương thức 401',
    quotaShare: '35 - 45% tổng chỉ tiêu',
    description: 'Xét tuyển theo bài thi Đánh giá năng lực do Đại học Quốc gia TP.HCM tổ chức trên thang điểm 1.200, đánh giá năng lực tư duy logic, ngôn ngữ và giải quyết vấn đề toàn diện.',
    badgeColor: 'emerald',
    requirements: [
      'Tham dự kỳ thi ĐGNL ĐHQG-HCM đợt 1 hoặc đợt 2 trong năm',
      'Đạt ngưỡng điểm sàn ĐGNL do Hội đồng Tuyển sinh trường quy định (thường từ 650/1.200 điểm trở lên)',
      'Tốt nghiệp THPT trong năm tuyển sinh',
    ],
    timeframe: 'Đăng ký xét tuyển: Tháng 4 - Tháng 6; Công bố kết quả sơ bộ: Tháng 6',
    steps: [
      'Đăng ký dự thi ĐGNL trên cổng https://thinangluc.vnuhcm.edu.vn',
      'Đăng ký nguyện vọng vào Trường ĐH KHXH&NV qua cổng chung của ĐHQG-HCM',
      'Trường xét tuyển từ điểm cao xuống thấp đến khi hết chỉ tiêu',
      'Xác nhận nhập học theo quy định của ĐHQG-HCM và Bộ GD&ĐT',
    ],
  },
  {
    id: 'PT3_UTXT',
    name: 'Phương thức 3: Ưu tiên xét tuyển theo quy định riêng của ĐHQG-HCM',
    shortName: 'Ưu tiên xét tuyển ĐHQG',
    codeName: 'Phương thức 302',
    quotaShare: '10 - 15% tổng chỉ tiêu',
    description: 'Dành riêng cho học sinh thuộc các trường THPT chuyên, năng khiếu và 149 trường THPT có chất lượng giáo dục cao trên toàn quốc theo danh sách do ĐHQG-HCM phê duyệt.',
    badgeColor: 'amber',
    requirements: [
      'Học sinh các trường THPT chuyên, năng khiếu trên toàn quốc',
      'Học sinh các trường THPT thuộc danh sách 149 trường ĐHQG-HCM quy định',
      'Hạnh kiểm Tốt cả 3 năm THPT và học lực Giỏi ít nhất 2 năm',
    ],
    timeframe: 'Tháng 5 - Tháng 6 hàng năm',
    steps: [
      'Khai báo thông tin học bạ và tải hồ sơ minh chứng lên hệ thống',
      'Ban Giám hiệu trường THPT xác nhận và nộp hồ sơ hợp lệ',
      'Hội đồng tuyển sinh xét duyệt theo tiêu chí điểm trung bình 3 năm + thư tự giới thiệu',
      'Công bố danh sách trúng tuyển có điều kiện',
    ],
  },
  {
    id: 'PT4_CHUNGCHI',
    name: 'Phương thức 4: Ưu tiên xét tuyển thí sinh có chứng chỉ quốc tế',
    shortName: 'Chứng chỉ quốc tế',
    codeName: 'Phương thức 409',
    quotaShare: '5 - 10% tổng chỉ tiêu',
    description: 'Dành cho thí sinh sở hữu chứng chỉ ngoại ngữ quốc tế (IELTS từ 6.0, TOEFL iBT, HSK, JLPT...) kết hợp với kết quả học bạ THPT hoặc bài thi chuẩn hóa SAT, ACT.',
    badgeColor: 'purple',
    requirements: [
      'Chứng chỉ IELTS từ 6.0 trở lên hoặc chứng chỉ tiếng Trung HSK 5, tiếng Nhật N3 trở lên',
      'Điểm trung bình học bạ các năm THPT đạt loại Khá trở lên',
      'Chứng chỉ còn thời hạn tính đến ngày nộp hồ sơ xét tuyển',
    ],
    timeframe: 'Tháng 5 - Tháng 7 hàng năm',
    steps: [
      'Đăng ký trực tuyến tại cổng tuyển sinh Trường ĐH KHXH&NV',
      'Nộp bản sao công chứng chứng chỉ quốc tế và học bạ THPT',
      'Hội đồng xét tuyển quy đổi điểm và xét thứ tự ưu tiên',
      'Nhận thông báo trúng tuyển',
    ],
  },
];

// Khảo sát định hướng 15 câu và hồ sơ ngành được chuyển sang src/data/orientationData.ts

export type TrainingProgramType = 
  | 'Chương trình chuẩn' 
  | 'Chương trình chuẩn quốc tế' 
  | 'Chương trình liên kết với nước ngoài';

export interface DetailedScoreEntry {
  id: string;
  year: number;
  majorCode: string;
  majorName: string;
  programType: TrainingProgramType | 'Chất lượng cao' | 'Cử nhân quốc tế';
  admissionMethod: string;
  rawMethodCode?: string;
  doiTuong?: string;
  combination: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export const DETAILED_SCORE_RECORDS: DetailedScoreEntry[] = [
  // 7140101 - Giáo dục học (matching image.png)
  { id: '1', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'B00', score: 76.20, maxScore: 100 },
  { id: '2', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'B00', score: 75.50, maxScore: 100 },
  { id: '3', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'C00', score: 75.50, maxScore: 100 },
  { id: '4', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'C00', score: 76.20, maxScore: 100 },
  { id: '5', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'C00', score: 75.50, maxScore: 100 },
  { id: '6', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'C01', score: 75.50, maxScore: 100 },
  { id: '7', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'C01', score: 76.20, maxScore: 100 },
  { id: '8', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'C01', score: 75.50, maxScore: 100 },
  { id: '9', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 75.50, maxScore: 100 },
  { id: '10', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 76.00, maxScore: 100 },
  { id: '11', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 75.50, maxScore: 100 },
  { id: '12', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 25.50, maxScore: 30 },
  { id: '13', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 25.25, maxScore: 30 },
  { id: '14', year: 2026, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 780, maxScore: 1200 },

  // 7320101 - Báo chí
  { id: '15', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'C00', score: 88.50, maxScore: 100 },
  { id: '16', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 87.20, maxScore: 100 },
  { id: '17', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D14', score: 87.50, maxScore: 100 },
  { id: '17b', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 87.50, maxScore: 100 },
  { id: '17c', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 86.80, maxScore: 100 },
  { id: '18', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 28.10, maxScore: 30 },
  { id: '19', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.80, maxScore: 30 },
  { id: '20', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D14', score: 27.90, maxScore: 30 },
  { id: '21', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chất lượng cao', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 26.50, maxScore: 30 },
  { id: '22', year: 2026, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 885, maxScore: 1200 },

  // 7320104 - Truyền thông đa phương tiện
  { id: '23', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 89.20, maxScore: 100 },
  { id: '24', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D14', score: 88.80, maxScore: 100 },
  { id: '24b', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 89.50, maxScore: 100 },
  { id: '24c', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 88.90, maxScore: 100 },
  { id: '25', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.90, maxScore: 30 },
  { id: '26', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D14', score: 27.85, maxScore: 30 },
  { id: '27', year: 2026, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 900, maxScore: 1200 },

  // 7310206 - Quan hệ quốc tế
  { id: '28', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 86.80, maxScore: 100 },
  { id: '28b', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 87.00, maxScore: 100 },
  { id: '28c', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 86.20, maxScore: 100 },
  { id: '29', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.20, maxScore: 30 },
  { id: '30', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D14', score: 27.10, maxScore: 30 },
  { id: '31', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chất lượng cao', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 26.25, maxScore: 30 },
  { id: '32', year: 2026, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 870, maxScore: 1200 },

  // 7310401 - Tâm lý học
  { id: '33', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'B00', score: 85.50, maxScore: 100 },
  { id: '33b', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 85.50, maxScore: 100 },
  { id: '33c', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 85.80, maxScore: 100 },
  { id: '33d', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 85.00, maxScore: 100 },
  { id: '34', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 27.40, maxScore: 30 },
  { id: '35', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.10, maxScore: 30 },
  { id: '36', year: 2026, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 865, maxScore: 1200 },

  // 7220201 - Ngôn ngữ Anh
  { id: '37', year: 2026, majorCode: '7220201', majorName: 'Ngôn ngữ Anh', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 86.00, maxScore: 100 },
  { id: '37b', year: 2026, majorCode: '7220201', majorName: 'Ngôn ngữ Anh', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 86.20, maxScore: 100 },
  { id: '37c', year: 2026, majorCode: '7220201', majorName: 'Ngôn ngữ Anh', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 85.50, maxScore: 100 },
  { id: '38', year: 2026, majorCode: '7220201', majorName: 'Ngôn ngữ Anh', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 26.85, maxScore: 30 },
  { id: '39', year: 2026, majorCode: '7220201', majorName: 'Ngôn ngữ Anh', programType: 'Chất lượng cao', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 25.80, maxScore: 30 },
  { id: '40', year: 2026, majorCode: '7220201', majorName: 'Ngôn ngữ Anh', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 860, maxScore: 1200 },

  // 7310614 - Hàn Quốc học
  { id: '41', year: 2026, majorCode: '7310614', majorName: 'Hàn Quốc học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 87.00, maxScore: 100 },
  { id: '41b', year: 2026, majorCode: '7310614', majorName: 'Hàn Quốc học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 87.20, maxScore: 100 },
  { id: '41c', year: 2026, majorCode: '7310614', majorName: 'Hàn Quốc học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 86.50, maxScore: 100 },
  { id: '42', year: 2026, majorCode: '7310614', majorName: 'Hàn Quốc học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.30, maxScore: 30 },
  { id: '43', year: 2026, majorCode: '7310614', majorName: 'Hàn Quốc học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D14', score: 27.40, maxScore: 30 },
  { id: '44', year: 2026, majorCode: '7310614', majorName: 'Hàn Quốc học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 865, maxScore: 1200 },

  // 7310613 - Nhật Bản học
  { id: '45', year: 2026, majorCode: '7310613', majorName: 'Nhật Bản học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 84.50, maxScore: 100 },
  { id: '45b', year: 2026, majorCode: '7310613', majorName: 'Nhật Bản học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 84.80, maxScore: 100 },
  { id: '45c', year: 2026, majorCode: '7310613', majorName: 'Nhật Bản học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 84.00, maxScore: 100 },
  { id: '46', year: 2026, majorCode: '7310613', majorName: 'Nhật Bản học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 26.50, maxScore: 30 },
  { id: '47', year: 2026, majorCode: '7310613', majorName: 'Nhật Bản học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D06', score: 26.30, maxScore: 30 },

  // 7810103 - Quản trị dịch vụ du lịch và lữ hành
  { id: '48a', year: 2026, majorCode: '7810103', majorName: 'Quản trị dịch vụ du lịch và lữ hành', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 85.20, maxScore: 100 },
  { id: '48b', year: 2026, majorCode: '7810103', majorName: 'Quản trị dịch vụ du lịch và lữ hành', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 85.50, maxScore: 100 },
  { id: '48c', year: 2026, majorCode: '7810103', majorName: 'Quản trị dịch vụ du lịch và lữ hành', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 84.80, maxScore: 100 },
  { id: '48', year: 2026, majorCode: '7810103', majorName: 'Quản trị dịch vụ du lịch và lữ hành', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 26.50, maxScore: 30 },
  { id: '49', year: 2026, majorCode: '7810103', majorName: 'Quản trị dịch vụ du lịch và lữ hành', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 26.35, maxScore: 30 },
  { id: '50', year: 2026, majorCode: '7810103', majorName: 'Quản trị dịch vụ du lịch và lữ hành', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL ĐHQG-HCM', combination: 'D01', score: 840, maxScore: 1200 },

  // 7310301 - Xã hội học
  { id: '51a', year: 2026, majorCode: '7310301', majorName: 'Xã hội học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 78.50, maxScore: 100 },
  { id: '51b', year: 2026, majorCode: '7310301', majorName: 'Xã hội học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 78.80, maxScore: 100 },
  { id: '51c', year: 2026, majorCode: '7310301', majorName: 'Xã hội học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 78.00, maxScore: 100 },
  { id: '51', year: 2026, majorCode: '7310301', majorName: 'Xã hội học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 25.40, maxScore: 30 },
  { id: '52', year: 2026, majorCode: '7310301', majorName: 'Xã hội học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 25.20, maxScore: 30 },

  // 7229030 - Văn học
  { id: '53a', year: 2026, majorCode: '7229030', majorName: 'Văn học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 82.50, maxScore: 100 },
  { id: '53b', year: 2026, majorCode: '7229030', majorName: 'Văn học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 83.00, maxScore: 100 },
  { id: '53c', year: 2026, majorCode: '7229030', majorName: 'Văn học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 82.00, maxScore: 100 },
  { id: '53', year: 2026, majorCode: '7229030', majorName: 'Văn học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 26.20, maxScore: 30 },
  { id: '54', year: 2026, majorCode: '7229030', majorName: 'Văn học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 25.90, maxScore: 30 },

  // 7229010 - Lịch sử
  { id: '55a', year: 2026, majorCode: '7229010', majorName: 'Lịch sử', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 77.50, maxScore: 100 },
  { id: '55b', year: 2026, majorCode: '7229010', majorName: 'Lịch sử', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 78.00, maxScore: 100 },
  { id: '55c', year: 2026, majorCode: '7229010', majorName: 'Lịch sử', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 77.00, maxScore: 100 },
  { id: '55', year: 2026, majorCode: '7229010', majorName: 'Lịch sử', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 24.80, maxScore: 30 },
  { id: '56', year: 2026, majorCode: '7229010', majorName: 'Lịch sử', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 24.50, maxScore: 30 },

  // 7229001 - Triết học
  { id: '57a', year: 2026, majorCode: '7229001', majorName: 'Triết học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + ĐGNL + Học bạ', combination: 'D01', score: 72.50, maxScore: 100 },
  { id: '57b', year: 2026, majorCode: '7229001', majorName: 'Triết học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'D01', score: 73.00, maxScore: 100 },
  { id: '57c', year: 2026, majorCode: '7229001', majorName: 'Triết học', programType: 'Chương trình chuẩn', admissionMethod: 'ĐGNL + Học bạ', combination: 'D01', score: 72.00, maxScore: 100 },
  { id: '57', year: 2026, majorCode: '7229001', majorName: 'Triết học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 22.80, maxScore: 30 },
  { id: '58', year: 2026, majorCode: '7229001', majorName: 'Triết học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 22.50, maxScore: 30 },

  // 2025 Historic records
  { id: '59', year: 2025, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'THPT + Học bạ', combination: 'C00', score: 75.80, maxScore: 100 },
  { id: '60', year: 2025, majorCode: '7140101', majorName: 'Giáo dục học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 25.10, maxScore: 30 },
  { id: '61', year: 2025, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 27.90, maxScore: 30 },
  { id: '62', year: 2025, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.60, maxScore: 30 },

  // 2024 Historic records
  { id: '63', year: 2024, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'C00', score: 27.80, maxScore: 30 },
  { id: '64', year: 2024, majorCode: '7320101', majorName: 'Báo chí', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.50, maxScore: 30 },
  { id: '65', year: 2024, majorCode: '7320104', majorName: 'Truyền thông đa phương tiện', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.50, maxScore: 30 },
  { id: '66', year: 2024, majorCode: '7310206', majorName: 'Quan hệ quốc tế', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 26.90, maxScore: 30 },
  { id: '67', year: 2024, majorCode: '7310401', majorName: 'Tâm lý học', programType: 'Chương trình chuẩn', admissionMethod: 'Thi tốt nghiệp THPT', combination: 'D01', score: 27.00, maxScore: 30 },
];

export const PRIORITY_AREA_POINTS = {
  'KV1': 0.75,
  'KV2-NT': 0.5,
  'KV2': 0.25,
  'KV3': 0.0,
};

export const PRIORITY_OBJECT_POINTS = {
  'None': 0,
  'UT1': 2.0,
  'UT2': 1.0,
};

export const FAQ_ITEMS = [
  {
    q: 'Trang Tra cứu điểm chuẩn sử dụng dữ liệu nào?',
    a: 'Trang Tra cứu điểm chuẩn đọc các bản ghi điểm chuẩn thực tế từ bộ sưu tập admission_scores trong Firestore. Bộ lọc chỉ hiển thị các năm và phương thức mà hệ thống có dữ liệu; dữ liệu tra cứu không phải điểm chuẩn dự đoán.',
  },
  {
    q: 'Trang Dự đoán trúng tuyển tính kết quả như thế nào?',
    a: 'Hệ thống tính điểm xét tuyển dự kiến từ điểm người dùng nhập theo từng phương thức DT01, DT02 hoặc DT03, sau đó đối chiếu với điểm chuẩn lịch sử phù hợp về ngành, phương thức, tổ hợp và hệ đào tạo để tính xác suất tham khảo theo khoảng cách điểm.',
  },
  {
    q: 'Điểm chuẩn tham chiếu năm 2026 có phải điểm chuẩn chính thức năm 2027 không?',
    a: 'Không. Khi dự đoán cho năm 2027, hệ thống dùng điểm chuẩn năm 2026 là dữ liệu lịch sử/tham chiếu gần nhất đang có trong Firestore. Hệ thống không tạo hoặc hiển thị điểm chuẩn 2027 giả.',
  },
  {
    q: 'Xác suất trong trang Dự đoán có phải kết quả trúng tuyển chắc chắn không?',
    a: 'Không. Đây là xác suất tham khảo được chuyển đổi từ khoảng cách giữa điểm xét tuyển dự kiến và điểm chuẩn lịch sử. Kết quả không phải cam kết và không thay thế thông báo tuyển sinh chính thức.',
  },
  {
    q: 'Điểm định hướng ngành có phải xác suất trúng tuyển không?',
    a: 'Không. Điểm phù hợp ngành được tính từ mức tương đồng giữa hồ sơ câu trả lời của người dùng và hồ sơ tiêu chí của ngành. Đây là kết quả định hướng học tập, tách biệt với điểm chuẩn và xác suất tham khảo của trang Dự đoán trúng tuyển.',
  },
  {
    q: 'Điểm thực tế và điểm giả định khác nhau như thế nào?',
    a: 'Hai lựa chọn dùng cùng công thức tính điểm. Điểm thực tế có thể được dùng để đóng góp vào dữ liệu phân bố điểm người dùng; điểm giả định chỉ phục vụ mô phỏng và xem mục tiêu điểm, không được hiểu là điểm đã đạt.',
  },
  {
    q: 'Vì sao kết quả dự đoán giữa các ngành có thể khác nhau?',
    a: 'Mỗi ngành được đối chiếu độc lập với điểm chuẩn lịch sử phù hợp của chính ngành đó. Vì vậy cùng một điểm xét tuyển có thể tạo ra khoảng cách điểm và xác suất tham khảo khác nhau giữa các ngành.',
  },
];
