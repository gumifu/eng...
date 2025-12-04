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
  const [currentSection, setCurrentSection] = useState(0); // 現在のセクション（0-16）
  const [isCarouselPaused, setIsCarouselPaused] = useState(true); // カルーセルの一時停止（初期は停止）
  const [isMounted, setIsMounted] = useState(false); // マウント状態
  const isUserScrollingRef = useRef(false); // ユーザーがスクロール中かどうか
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // スクロール停止検出用タイマー

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
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
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

      // 最後のセクション（17: フッター）の場合は最初のセクション（0）に戻る
      // ただし、スクロール位置は18（最初のセクションの複製）に移動してから、スムーズに最初に戻る
      let nextSectionIndex;
      let targetScroll;
      if (currentSectionIndex >= 17) {
        // フッターを過ぎたら最初のセクションの複製（18）に移動
        nextSectionIndex = 0;
        targetScroll = 18 * sectionHeight;
        
        // スムーズにセクション18に移動
        scrollElement.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
        
        // セクション18に到達したら、スムーズに最初のセクションに戻る
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }, 500); // スクロール完了を待つ
      } else {
        nextSectionIndex = currentSectionIndex + 1;
        targetScroll = nextSectionIndex * sectionHeight;
        
        // スムーズに次のセクションへスクロール
        scrollElement.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      }

      setCurrentSection(nextSectionIndex);
    }, 5000); // 5秒ごとに次のセクションへ
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

    // フッター（セクション17）を過ぎて最初のセクションの複製（セクション18）に到達したら、
    // スムーズに元の最初のセクション（セクション0）の位置に戻す
    if (section >= 18) {
      // スムーズに最初のセクションに戻す
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 100);
      setCurrentSection(0);
    } else if (section === 17) {
      // フッターセクション
      setCurrentSection(16);
    } else {
      setCurrentSection(Math.min(section, 16));
    }
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
    e.stopPropagation();
    // テキスト選択を防ぐ
    if (e.target instanceof HTMLElement) {
      e.target.style.userSelect = "none";
    }
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
    e.preventDefault();
    e.stopPropagation();

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

      // ユーザーがスクロールしていることを検出
      isUserScrollingRef.current = true;
      setIsCarouselPaused(true);

      // スクロール停止を検出するタイマーをリセット
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // スクロールが停止してから1秒後にカルーセルを再開
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
        if (!isLongPress) {
          setIsCarouselPaused(false);
        }
      }, 1000);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateCurrentSection, isLongPress]);

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
            className="h-screen w-full flex items-end justify-start relative"
            style={{
              backgroundImage: `url(${getFashionImage(index)})`,
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* フォールバック背景（画像が読み込めない場合） */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 -z-10" />
            <div className="text-white text-6xl font-bold drop-shadow-lg relative z-10 pb-8 pl-8">
              Section {index + 1}
            </div>
          </section>
        ))}

        {/* セクション17: フッター（H&Mスタイル） */}
        <section className="h-screen w-full flex flex-col relative bg-white">
          <div className="flex-1 flex flex-col justify-between px-8 py-12 max-w-7xl mx-auto w-full">
            {/* メインコンテンツエリア */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-16">
              {/* 左側：ナビゲーションリンク */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between cursor-pointer group">
                  <span className="text-black font-semibold text-base">
                    SHOP
                  </span>
                  <span className="text-black text-xl">+</span>
                </div>
                <div className="ml-0 flex flex-col gap-3 text-sm text-black">
                  <a href="#" className="hover:underline">
                    WOMEN
                  </a>
                  <a href="#" className="hover:underline">
                    MEN
                  </a>
                  <a href="#" className="hover:underline">
                    KIDS
                  </a>
                  <a href="#" className="hover:underline">
                    HOME
                  </a>
                  <a href="#" className="hover:underline">
                    STUDENT DISCOUNT
                  </a>
                  <a href="#" className="hover:underline">
                    GIFT CARDS
                  </a>
                </div>

                <div className="flex items-center justify-between cursor-pointer group mt-4">
                  <span className="text-black font-semibold text-base">
                    CORPORATE INFO
                  </span>
                  <span className="text-black text-xl">+</span>
                </div>

                <div className="flex items-center justify-between cursor-pointer group">
                  <span className="text-black font-semibold text-base">
                    HELP
                  </span>
                  <span className="text-black text-xl">+</span>
                </div>

                <div className="flex items-center justify-between cursor-pointer group">
                  <span className="text-black font-semibold text-base">
                    BECOME A MEMBER
                  </span>
                  <span className="text-black text-xl">+</span>
                </div>
              </div>

              {/* 中央：ロゴとリージョン */}
              {/* <div className="flex flex-col items-start md:items-center gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-sm text-black">
                  <span>Canada (en) ($)</span>
                  <a href="#" className="underline hover:no-underline">
                    CHANGE REGION
                  </a>
                </div>
              </div> */}
            </div>

            {/* 下部：ソーシャルメディアとコピーライト */}
            <div className="flex flex-col gap-6 mt-12">
              {/* ソーシャルメディアアイコン */}
              <div className="flex gap-6">
                {/* Instagram */}
                <a
                  href="#"
                  className="text-black hover:opacity-70"
                  aria-label="Instagram"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="17" cy="7" r="1.5" fill="currentColor" />
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href="#"
                  className="text-black hover:opacity-70"
                  aria-label="TikTok"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                {/* Spotify */}
                <a
                  href="#"
                  className="text-black hover:opacity-70"
                  aria-label="Spotify"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M6 12c0 0 4-2 6-2s6 2 6 2M6 9c0 0 4-2 6-2s6 2 6 2M6 15c0 0 4-2 6-2s6 2 6 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="#"
                  className="text-black hover:opacity-70"
                  aria-label="YouTube"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect
                      x="2"
                      y="7"
                      width="20"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path d="M10 12l4-2v4l-4-2z" fill="currentColor" />
                  </svg>
                </a>
                {/* Pinterest */}
                <a
                  href="#"
                  className="text-black hover:opacity-70"
                  aria-label="Pinterest"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M12 8c-2 0-3 1.5-3 2.5 0 .5.5 2 1.5 2.5.5.5 1 0 1-1.5 0-1-1-1.5-1-2.5 0-1.5 1-2.5 2.5-2.5 1.5 0 2.5 1 2.5 2.5 0 2-1.5 3.5-3.5 3.5-1 0-2-.5-2.5-1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="#"
                  className="text-black hover:opacity-70"
                  aria-label="Facebook"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M13 8h3v3h-3v8h-3v-8H8V8h2V6.5c0-1.5 1-2.5 2.5-2.5H15v3h-2z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>

              {/* コピーライト */}
              <div className="text-black text-xs">
                <p>
                  The content of this site is copyright-protected and is the
                  property of H & M Hennes & Mauritz AB.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* セクション18: 最初のセクションの複製（ループ用） */}
        <section
          className="h-screen w-full flex items-end justify-start relative"
          style={{
            backgroundImage: `url(${getFashionImage(0)})`,
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* フォールバック背景（画像が読み込めない場合） */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 -z-10" />
          <div className="text-white text-6xl font-bold drop-shadow-lg relative z-10 pb-8 pl-8">
            Section 1
          </div>
        </section>
      </div>

      {/* コントローラードット（右端中央配置、Apple風デザイン） */}
      <div
        ref={dotRef}
        className="fixed top-1/2 touch-none z-50 flex flex-col items-center justify-center transition-all duration-300 ease-out select-none"
        style={{
          right: "16px",
          transform: "translateY(-50%)",
          height: isLongPress ? "120px" : "auto", // 上下40px + ボタン40px = 120px
          width: isLongPress ? "56px" : "48px", // 左右8px + ボタン40px = 56px
          paddingTop: "80px",
          paddingBottom: "80px",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
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
              // 17セクションを5つのドットにマッピング
              // 各ドットは約3-4セクションを表す
              const sectionRange = 17 / 5; // 3.4セクション/ドット
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

      {/* スタイル（スクロールバー非表示用、モバイルでのカーソル非表示用） */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* モバイルデバイスでのみカーソルを非表示 */
        @media (hover: none) and (pointer: coarse) {
          [data-demo-page] * {
            cursor: none !important;
            -webkit-tap-highlight-color: transparent;
          }
          [data-demo-page] *:active {
            cursor: none !important;
          }
        }
        /* コントローラー上では常にカーソルを非表示 */
        [data-demo-page] [class*="touch-none"] {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
}
