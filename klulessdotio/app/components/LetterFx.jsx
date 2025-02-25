'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

const defaultCharset = ["X", "$", "@", "a", "H", "z", "o", "0", "y", "#", "?", "*", "0", "1", "+"];

function getRandomCharacter(charset) {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

function createEventHandler(
  originalText,
  setText,
  inProgress,
  setInProgress,
  speed,
  charset,
  setHasAnimated
) {
  const speedSettings = {
    fast: {
      BASE_DELAY: 10,
      REVEAL_DELAY: 10,
      INITIAL_RANDOM_DURATION: 100,
    },
    medium: {
      BASE_DELAY: 30,
      REVEAL_DELAY: 30,
      INITIAL_RANDOM_DURATION: 300,
    },
    slow: {
      BASE_DELAY: 60,
      REVEAL_DELAY: 60,
      INITIAL_RANDOM_DURATION: 600,
    },
  };

  const { BASE_DELAY, REVEAL_DELAY, INITIAL_RANDOM_DURATION } = speedSettings[speed];

  const generateRandomText = () =>
    originalText
      .split("")
      .map((char) => (char === " " ? " " : getRandomCharacter(charset)))
      .join("");

  return async () => {
    if (inProgress) return;

    setInProgress(true);

    let randomizedText = generateRandomText();
    const endTime = Date.now() + INITIAL_RANDOM_DURATION;

    while (Date.now() < endTime) {
      setText(randomizedText);
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY));
      randomizedText = generateRandomText();
    }

    for (let i = 0; i < originalText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, REVEAL_DELAY));
      setText(`${originalText.substring(0, i + 1)}${randomizedText.substring(i + 1)}`);
    }

    setInProgress(false);
    if (setHasAnimated) {
      setHasAnimated(true);
    }
  };
}

const LetterFx = ({
  children,
  trigger = "hover",
  speed = "medium",
  charset = defaultCharset,
  onTrigger,
  className,
  style,
}) => {
  const [text, setText] = useState(typeof children === "string" ? children : "");
  const [inProgress, setInProgress] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const originalText = useRef(typeof children === "string" ? children : "");

  const eventHandler = useCallback(() => {
    if (inProgress || isComplete) return;

    setInProgress(true);

    const speedSettings = {
      fast: {
        BASE_DELAY: 10,
        REVEAL_DELAY: 10,
        INITIAL_RANDOM_DURATION: 100,
      },
      medium: {
        BASE_DELAY: 30,
        REVEAL_DELAY: 30,
        INITIAL_RANDOM_DURATION: 300,
      },
      slow: {
        BASE_DELAY: 60,
        REVEAL_DELAY: 60,
        INITIAL_RANDOM_DURATION: 600,
      },
    };

    const { BASE_DELAY, REVEAL_DELAY, INITIAL_RANDOM_DURATION } = speedSettings[speed];

    const generateRandomText = () =>
      originalText.current
        .split("")
        .map((char) => (char === " " ? " " : getRandomCharacter(charset)))
        .join("");

    const runAnimation = async () => {
      let randomizedText = generateRandomText();
      const endTime = Date.now() + INITIAL_RANDOM_DURATION;

      while (Date.now() < endTime) {
        setText(randomizedText);
        await new Promise((resolve) => setTimeout(resolve, BASE_DELAY));
        randomizedText = generateRandomText();
      }

      for (let i = 0; i < originalText.current.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, REVEAL_DELAY));
        setText(`${originalText.current.substring(0, i + 1)}${randomizedText.substring(i + 1)}`);
      }

      setInProgress(false);
      setIsComplete(true);
      if (trigger === "instant") {
        setHasAnimated(true);
      }
    };

    runAnimation();
  }, [inProgress, isComplete, speed, charset, trigger]);

  useEffect(() => {
    if (typeof children === "string") {
      if (!inProgress && !isComplete) {
        setText(children);
      }
      originalText.current = children;

      if (trigger === "instant" && !hasAnimated && !isComplete) {
        eventHandler();
      }
    }
  }, [children, trigger, eventHandler, hasAnimated, inProgress, isComplete]);

  useEffect(() => {
    if (trigger === "custom" && onTrigger && !isComplete) {
      onTrigger(() => {
        if (!isComplete) {
          eventHandler();
        }
      });
    }
  }, [trigger, onTrigger, eventHandler, isComplete]);

  return (
    <span
      className={className}
      style={style}
      onMouseOver={trigger === "hover" && !isComplete ? eventHandler : undefined}
    >
      {text}
    </span>
  );
};

export { LetterFx }; 