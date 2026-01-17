// src/components/BusinessCardThumbnail.tsx
import Image from 'next/image';

export default function BusinessCardThumbnail() {
  return (
    <Image
      src="/images/businesscard.png"    // public/images/businesscard.png
      alt="Hyunji Oh Business Card"
      width={1024}                       // 원본 비율 계산용
      height={1024}                      // 원본 비율 계산용
      style={{
        width: '100%',                   // 부모 폭 100%
        height: 'auto',                  // 비율에 맞춰 높이 자동
        maxWidth: '512px',               // 최대 크기 제한
        borderRadius: '16px',            // 약간 둥근 모서리
        boxShadow: '0 18px 40px rgba(0,0,0,0.15)', // 그림자
        objectFit: 'cover',              // 잘림 없이 꽉 채우기
        display: 'block',                // inline 요소일 때 생기는 공백 제거
        margin: '0 auto',                // 가운데 정렬
      }}
    />
  );
}
