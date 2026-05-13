"use client";

import Image from "next/image";
import { useRef } from "react";
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

// TODO: fix dragging the carousel

export function ValueCarousel({ cards }: ValueCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
  });

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
    };

    track.setPointerCapture(event.pointerId);
  }

  function continueDrag(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const track = trackRef.current;
    const dragState = dragStateRef.current;

    if (!track || !dragState.active) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - dragState.startX;
    track.scrollLeft = dragState.startScrollLeft - deltaX;
  }

  function endDrag(
    event?: ReactPointerEvent<HTMLDivElement>,
  ) {
    const track = trackRef.current;
    const pointerId = dragStateRef.current.pointerId;

    if (track && pointerId !== null && event) {
      try {
        track.releasePointerCapture(pointerId);
      } catch {}
    }

    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;
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
    </div>
  );
}
