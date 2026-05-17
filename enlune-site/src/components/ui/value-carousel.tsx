"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type ValueCard = {
  title: string;
  description: string;
  iconSrc: string;
  hue: number;
  starsPosition: string;
};

type ValueCarouselProps = {
  cards: readonly ValueCard[];
};

export function ValueCarousel({ cards }: ValueCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [handleStyle, setHandleStyle] = useState<CSSProperties>({
    width: "22%",
    left: "0%",
  });
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
    mode: "track" | "handle";
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    mode: "track",
  });

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    function updateHandle() {
      const currentTrack = trackRef.current;

      if (!currentTrack) {
        return;
      }

      const maxScroll = currentTrack.scrollWidth - currentTrack.clientWidth;

      if (maxScroll <= 0) {
        setHandleStyle({
          width: "100%",
          left: "0%",
        });
        return;
      }

      const visibleRatio = currentTrack.clientWidth / currentTrack.scrollWidth;
      const thumbRatio = Math.max(0.14, Math.min(0.32, visibleRatio));
      const progress = currentTrack.scrollLeft / maxScroll;
      const widthPercent = thumbRatio * 100;
      const leftPercent = progress * (100 - widthPercent);

      setHandleStyle({
        width: `${widthPercent}%`,
        left: `${leftPercent}%`,
      });
    }

    updateHandle();
    track.addEventListener("scroll", updateHandle, { passive: true });
    window.addEventListener("resize", updateHandle);

    return () => {
      track.removeEventListener("scroll", updateHandle);
      window.removeEventListener("resize", updateHandle);
    };
  }, []);

  function beginDrag(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const track = trackRef.current;

    if (!track || event.button !== 0) {
      return;
    }

    event.preventDefault();

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      mode: "track",
    };

    track.setPointerCapture(event.pointerId);
  }

  function beginHandleDrag(
    event: ReactPointerEvent<HTMLSpanElement>,
  ) {
    const track = trackRef.current;

    if (!track || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      mode: "handle",
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function continueDrag(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const track = trackRef.current;
    const handle = handleRef.current;
    const dragState = dragStateRef.current;

    if (!track || !dragState.active) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - dragState.startX;

    if (dragState.mode === "handle" && handle) {
      const thumb = handle.firstElementChild;

      if (!(thumb instanceof HTMLSpanElement)) {
        return;
      }

      const maxScroll = track.scrollWidth - track.clientWidth;
      const maxHandleTravel = handle.clientWidth - thumb.clientWidth;

      if (maxScroll <= 0 || maxHandleTravel <= 0) {
        return;
      }

      const scrollDelta = (deltaX / maxHandleTravel) * maxScroll;
      track.scrollLeft = dragState.startScrollLeft + scrollDelta;
      return;
    }

    track.scrollLeft = dragState.startScrollLeft - deltaX;
  }

  function endDrag(
    event?: ReactPointerEvent<HTMLDivElement>,
  ) {
    const track = trackRef.current;
    const pointerId = dragStateRef.current.pointerId;

    if (track && pointerId !== null && event && dragStateRef.current.mode === "track") {
      try {
        track.releasePointerCapture(pointerId);
      } catch {}
    }

    if (pointerId !== null && event && dragStateRef.current.mode === "handle") {
      try {
        event.currentTarget.releasePointerCapture(pointerId);
      } catch {}
    }

    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;
    dragStateRef.current.mode = "track";
  }

  return (
    <div className="value-carousel">
      <div
        ref={trackRef}
        className="value-carousel__track"
        onPointerDown={beginDrag}
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {cards.map((card) => (
          <article
            key={card.title}
            className="value-card"
            style={
              {
                "--value-card-hue": `${card.hue}`,
                "--value-card-stars-position": card.starsPosition,
              } as CSSProperties
            }
          >
            <div className="value-card__icon-wrap">
              <Image
                src={card.iconSrc}
                alt=""
                width={52}
                height={52}
                className="value-card__icon"
                aria-hidden="true"
                draggable={false}
              />
            </div>

            <div className="value-card__content">
              <h3 className="text-lg font-medium text-inverse">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-muted-inverse">
                {card.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div
        ref={handleRef}
        className="value-carousel__handle"
        aria-hidden="true"
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span
          className="value-carousel__handle-thumb"
          style={handleStyle}
          onPointerDown={beginHandleDrag}
        />
      </div>
    </div>
  );
}
