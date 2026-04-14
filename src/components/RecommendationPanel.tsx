interface RecommendationPanelProps {
  attemptNumber: number
  suggestion: string
  candidateCount: number
}

export function RecommendationPanel({
  attemptNumber,
  suggestion,
  candidateCount,
}: RecommendationPanelProps) {
  return (
    <div className="bg-green-950 border border-green-800 rounded-xl p-4">
      <p className="text-xs text-green-400 mb-2 font-medium">
        {attemptNumber}번째 시도 추천
      </p>
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-bold tracking-widest text-white">
          {suggestion}
        </span>
        <span className="text-sm text-gray-400">
          후보 {candidateCount}개
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        카카오에서 이 단어를 입력해보세요
      </p>
    </div>
  )
}
