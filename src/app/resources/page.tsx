import Link from 'next/link'
import { ArrowLeft, ExternalLink, Search, Building2, Landmark, Store } from 'lucide-react'

const RESOURCES = [
  {
    title: '공정거래위원회 가맹사업정보제공시스템',
    description: '본사 정보공개서 열람, 브랜드 가맹점 수, 위법 사실 등을 조회할 수 있습니다.',
    url: 'https://franchise.ftc.go.kr/mnu/00013/program/userRqst/list.do',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '소상공인시장진흥공단 상권정보시스템',
    description: '후보 상권의 유동 인구, 경쟁 점포, 예상 매출 등을 무료로 분석할 수 있습니다.',
    url: 'https://sg.sbiz.or.kr/',
    icon: Store,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: '대법원 인터넷등기소',
    description: '상가 계약 전 건물주의 근저당권, 압류 여부 등 부동산 등기부등본을 확인합니다.',
    url: 'http://www.iros.go.kr/',
    icon: Landmark,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: '정부24 건축물대장 열람',
    description: '입점할 상가의 용도가 일반음식점(또는 휴게음식점)으로 허가받을 수 있는지 확인합니다.',
    url: 'https://www.gov.kr/portal/main/nologin',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-20">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">필수 실사 사이트 모음</h1>
      </header>

      <main className="px-4 py-6">
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          프랜차이즈 가맹 계약 전, 본사의 말만 믿지 말고 아래 국가 공식 기관의 데이터를 직접 교차 검증해 보세요.
        </p>

        <div className="space-y-4">
          {RESOURCES.map((res, idx) => {
            const Icon = res.icon
            return (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${res.bgColor} ${res.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors pr-6">
                      {res.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                      {res.description}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                      사이트 열기 <ExternalLink size={14} />
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </main>
    </div>
  )
}
