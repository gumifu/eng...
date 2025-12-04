"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Unsplash ファッション画像のIDリスト（縦長portrait、16枚）
const FASHION_IMAGE_IDS = [
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
  "1503341455253-b2e723bb3dbb",
];

// ファッション画像を取得（各セクションごとに異なる画像）
const getFashionImage = (index: number) => {
  const imageId = FASHION_IMAGE_IDS[index % FASHION_IMAGE_IDS.length];
  // Unsplashの画像URL（縦長portrait、横幅に合わせて、top固定）
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=1920&h=2880&q=85`;
};

// パラメータ定数（スムーズさを向上）
const LONG_PRESS_DELAY = 400; // ms
const MAX_SPEED = 18; // px/frame（少し上げる）
const DEAD_ZONE = 15; // px
const MAX_DISTANCE = 100; // px
const SMOOTHING = 0.2; // 0-1（0.12 → 0.2に上げてよりスムーズに）

export default function DemoPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 状態管理
  const [isLongPress, setIsLongPress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 }); // ボタンの移動量
  const [currentSection, setCurrentSection] = useState(0); // 現在のセクション（0-15）
  const [isCarouselPaused, setIsCarouselPaused] = useState(true); // カルーセルの一時停止（初期は停止）
  const [isMounted, setIsMounted] = useState(false); // マウント状態

  // スクロール制御用の状態
  const initialCenterPosRef = useRef({ x: 0, y: 0 }); // 初期中心位置
  const currentSpeedRef = useRef(0);
  const targetSpeedRef = useRef(0);
  const directionYRef = useRef(0);
  const animateRef = useRef<(() => void) | null>(null);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null); // カルーセル用のタイマー
  const startCarouselRef = useRef<(() => void) | undefined>(undefined); // startCarousel関数の参照

  // クリーンアップ関数
  const cleanup = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }
  };

  // カルーセルの自動スクロール
  const startCarousel = useCallback(() => {
    if (isCarouselPaused || !scrollContainerRef.current) return;

    carouselIntervalRef.current = setInterval(() => {
      if (!scrollContainerRef.current || isCarouselPaused) return;

      const scrollElement = scrollContainerRef.current;
      const sectionHeight = window.innerHeight;
      const currentScroll = scrollElement.scrollTop;
      const currentSectionIndex = Math.round(currentScroll / sectionHeight);
      const nextSectionIndex = Math.min(currentSectionIndex + 1, 15);
      const targetScroll = nextSectionIndex * sectionHeight;

      // スムーズに次のセクションへスクロール
      scrollElement.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });

      setCurrentSection(nextSectionIndex);
    }, 3000); // 3秒ごとに次のセクションへ
  }, [isCarouselPaused]);

  // startCarouselの参照を更新
  useEffect(() => {
    startCarouselRef.current = startCarousel;
  }, [startCarousel]);

  // startCarouselの参照を更新
  useEffect(() => {
    startCarouselRef.current = startCarousel;
  }, [startCarousel]);

  // スクロール位置から現在のセクションを更新
  const updateCurrentSection = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const scrollElement = scrollContainerRef.current;
    const sectionHeight = window.innerHeight;
    const currentScroll = scrollElement.scrollTop;
    const section = Math.round(currentScroll / sectionHeight);
    setCurrentSection(Math.min(section, 15));
  }, []);

  // アニメーションループ（最適化版）
  const animate = useCallback(() => {
    if (!isDragging || !scrollContainerRef.current) {
      rafIdRef.current = null;
      return;
    }

    const scrollElement = scrollContainerRef.current;

    // スムージング処理（より滑らかに）
    const speedDiff = targetSpeedRef.current - currentSpeedRef.current;
    currentSpeedRef.current += speedDiff * SMOOTHING;

    // スクロール実行（速度が十分大きい場合のみ）
    if (Math.abs(currentSpeedRef.current) > 0.05) {
      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
      const currentScroll = scrollElement.scrollTop;

      // スクロール位置を計算
      const scrollDelta = currentSpeedRef.current * directionYRef.current;
      const newScroll = Math.max(
        0,
        Math.min(maxScroll, currentScroll + scrollDelta)
      );

      // 直接スクロール位置を設定（よりスムーズ）
      scrollElement.scrollTop = newScroll;
    } else {
      // 速度が小さい場合は停止
      currentSpeedRef.current = 0;
    }

    if (animateRef.current) {
      rafIdRef.current = requestAnimationFrame(animateRef.current);
    }
  }, [isDragging]);

  // animateの参照を更新
  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  // 長押し開始
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dotRef.current) return;

    // カルーセルを一時停止
    setIsCarouselPaused(true);
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }

    const rect = dotRef.current.getBoundingClientRect();
    initialCenterPosRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // ボタンのオフセットをリセット
    setButtonOffset({ x: 0, y: 0 });

    // 長押しタイマー開始
    pressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      setIsDragging(true);
      dotRef.current?.setPointerCapture(e.pointerId);
      if (rafIdRef.current === null && animateRef.current) {
        rafIdRef.current = requestAnimationFrame(animateRef.current);
      }
    }, LONG_PRESS_DELAY);
  };

  // 移動追跡（最適化版）
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dotRef.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    // 初期中心位置からの差分計算
    const deltaX = currentX - initialCenterPosRef.current.x;
    const deltaY = currentY - initialCenterPosRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // デッドゾーン判定
    if (distance < DEAD_ZONE) {
      targetSpeedRef.current = 0;
      directionYRef.current = 0;
      setButtonOffset({ x: 0, y: 0 });
      return;
    }

    // 距離の正規化（より滑らかなカーブ）
    const clampedDistance = Math.min(distance, MAX_DISTANCE);
    const normalizedDistance =
      (clampedDistance - DEAD_ZONE) / (MAX_DISTANCE - DEAD_ZONE);

    // イージング関数を適用（より自然な速度変化）
    const easedDistance = normalizedDistance * normalizedDistance; // 二次関数で滑らかに

    // 速度計算
    targetSpeedRef.current = easedDistance * MAX_SPEED;

    // 方向ベクトルの正規化
    directionYRef.current = deltaY / distance;

    // ボタンの移動量を設定（最大30pxまで移動）
    const maxButtonMove = 30;
    const buttonMoveDistance = Math.min(distance - DEAD_ZONE, maxButtonMove);
    const buttonMoveX = (deltaX / distance) * buttonMoveDistance;
    const buttonMoveY = (deltaY / distance) * buttonMoveDistance;
    setButtonOffset({ x: buttonMoveX, y: buttonMoveY });
  };

  // 終了処理
  const handlePointerUp = useCallback(() => {
    cleanup();
    setIsLongPress(false);
    setIsDragging(false);
    setButtonOffset({ x: 0, y: 0 }); // ボタンを元の位置に戻す
    currentSpeedRef.current = 0;
    targetSpeedRef.current = 0;
    directionYRef.current = 0;

    // カルーセルを再開
    setIsCarouselPaused(false);

    // Note: setPointerCapture でキャプチャしたポインターは自動的に解放される
  }, []);

  const handlePointerCancel = () => {
    handlePointerUp();
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      cleanup();
    }
  };

  // スクロールイベントリスナー
  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      updateCurrentSection();
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [updateCurrentSection]);

  // カルーセルの開始/停止
  useEffect(() => {
    // マウントされていない場合は実行しない
    if (!isMounted) return;

    if (!isCarouselPaused && !isLongPress) {
      // 少し遅延してから開始（初期化を待つ）
      const timeoutId = setTimeout(() => {
        if (startCarouselRef.current) {
          startCarouselRef.current();
        }
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
        if (carouselIntervalRef.current) {
          clearInterval(carouselIntervalRef.current);
          carouselIntervalRef.current = null;
        }
      };
    } else {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
    }
  }, [isMounted, isCarouselPaused, isLongPress]);

  // マウント状態の管理（ハイドレーションエラーを防ぐ）
  useEffect(() => {
    // マウント後に状態を更新（次のレンダリングサイクルで）
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      setIsCarouselPaused(false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // クリーンアップ（アンマウント時）
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // ドラッグ状態が変わったらアニメーションループを開始/停止
  useEffect(() => {
    if (isDragging && rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(animate);
    } else if (!isDragging && rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, [isDragging, animate]);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black"
      data-demo-page
    >
      {/* スクロールコンテナ */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* 16個のセクション */}
        {Array.from({ length: 16 }).map((_, index) => (
          <section
            key={index}
            className="h-screen w-full flex items-center justify-center relative"
            style={{
              backgroundImage: `url(${getFashionImage(index)})`,
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* フォールバック背景（画像が読み込めない場合） */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 -z-10" />
            <div className="text-white text-6xl font-bold drop-shadow-lg relative z-10">
              Section {index + 1}
            </div>
          </section>
        ))}
      </div>

      {/* コントローラードット（右端中央配置、Apple風デザイン） */}
      <div
        ref={dotRef}
        className="fixed top-1/2 touch-none z-50 flex flex-col items-center justify-center transition-all duration-300 ease-out"
        style={{
          right: "16px",
          transform: "translateY(-50%)",
          height: isLongPress ? "120px" : "auto", // 上下40px + ボタン40px = 120px
          width: isLongPress ? "56px" : "48px", // 左右8px + ボタン40px = 56px
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      >
        {/* 外側の枠（楕円形、長押し後に表示、固定） */}
        {isLongPress && (
          <div
            className="absolute rounded-full transition-all duration-300 ease-out"
            style={{
              top: "40px",
              bottom: "40px",
              left: "8px",
              right: "8px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow:
                "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
          />
        )}

        {/* 長押し前：5つのドット（カルーセルインジケーター） */}
        {!isLongPress && (
          <div className="relative flex flex-col items-center justify-center gap-2 py-2">
            {/* 5つのドット（現在のセクションに対応） */}
            {[0, 1, 2, 3, 4].map((dotIndex) => {
              // 16セクションを5つのドットにマッピング
              // 各ドットは約3-4セクションを表す
              const sectionRange = 16 / 5; // 3.2セクション/ドット
              const sectionStart = Math.floor(dotIndex * sectionRange);
              const sectionEnd = Math.floor((dotIndex + 1) * sectionRange);
              const isActive =
                currentSection >= sectionStart && currentSection < sectionEnd;

              return (
                <div
                  key={dotIndex}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: isActive
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.5)",
                    transform: isActive ? "scale(1.2)" : "scale(1)",
                    boxShadow: isActive
                      ? "0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)"
                      : "0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 長押し後：内側のボタン（動く部分） */}
        {isLongPress && (
          <div
            className="relative flex items-center justify-center transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${buttonOffset.x}px, ${buttonOffset.y}px)`,
            }}
          >
            <div
              className="rounded-full transition-all duration-300 ease-out flex items-center justify-center"
              style={{
                width: "40px",
                height: "40px",
                transform: `scale(${isDragging ? 1.05 : 1})`,
                background: isDragging
                  ? "rgba(255, 255, 255, 0.35)"
                  : "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(10px) saturate(180%)",
                WebkitBackdropFilter: "blur(10px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow: isDragging
                  ? "0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.1)"
                  : "0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.08)",
              }}
            ></div>
          </div>
        )}
      </div>

      {/* スタイル（スクロールバー非表示用） */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
