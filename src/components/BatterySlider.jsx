import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChargingIcon } from "./icons/ChargingIcon";

export default function BatterySlider({ initialCharge = 72 }) {
  const [charge, setCharge] = useState(initialCharge);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  // Use a ref for tracking drag state to avoid closure issues
  const isDraggingRef = useRef(false);

  // Calculate time left based on percentage - simplified with a helper function
  const timeLeft = useMemo(() => {
    // Remaining percentage before fully charged
    const remainingPercentage = 100 - charge;

    // Format time display helper
    const formatTime = (hrs = 0, mins = 0) => {
      if (remainingPercentage <= 1) return "fully charged";
      if (hrs === 0) return `${mins} min left`;
      if (mins === 0) return `${hrs} hr left`;
      return `${hrs} hr ${mins} min left`;
    };

    // Time calculation based on charge level
    if (remainingPercentage <= 5) {
      return formatTime(0, remainingPercentage);
    } else if (remainingPercentage <= 20) {
      return formatTime(0, Math.floor(remainingPercentage * 1.2));
    } else if (remainingPercentage <= 50) {
      const minutes = Math.floor(remainingPercentage * 1.5);
      return formatTime(Math.floor(minutes / 60), minutes % 60);
    } else {
      return formatTime(
        Math.floor(remainingPercentage / 20),
        Math.floor((remainingPercentage % 20) * 3),
      );
    }
  }, [charge]);

  // Update the charge based on pointer position - with logging for debugging
  const updateChargeFromPosition = (clientX) => {
    if (!containerRef.current) return;

    try {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const width = rect.width || 1; // Prevent division by zero
      const newPercentage = (x / width) * 100;
      const roundedPercentage = Math.round(newPercentage);

      // Log for debugging
      console.log(
        `Updating charge: ${roundedPercentage}%, x: ${x}, width: ${width}`,
      );

      // Force immediate update and bypass batching
      setCharge(roundedPercentage);
    } catch (error) {
      console.error("Error updating charge:", error);
    }
  };

  // Mouse handlers - using ref for tracking to avoid state closure issues
  const handleMouseDown = (e) => {
    console.log("Mouse down detected");
    // Update charge immediately based on click position
    updateChargeFromPosition(e.clientX);
    // Set both state and ref
    isDraggingRef.current = true;
    setIsDragging(true);
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (e) => {
    // Use ref instead of state to avoid closure issues
    if (!isDraggingRef.current) return;
    updateChargeFromPosition(e.clientX);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      console.log("Touch start detected");
      // Update charge immediately based on touch position
      updateChargeFromPosition(e.touches[0].clientX);
      // Set both state and ref
      isDraggingRef.current = true;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    // Use ref instead of state to avoid closure issues
    if (!isDraggingRef.current) return;
    if (e.touches && e.touches[0]) {
      updateChargeFromPosition(e.touches[0].clientX);
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleDragEnd = () => {
    console.log("Drag end detected");
    // Set both state and ref
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Set up event listeners
  useEffect(() => {
    // Create stable references to event handlers that don't depend
    // on closure variables that might change
    const mouseMoveHandler = (e) => handleMouseMove(e);
    const touchMoveHandler = (e) => handleTouchMove(e);
    const dragEndHandler = () => handleDragEnd();

    // Attach listeners
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", dragEndHandler);
    document.addEventListener("touchmove", touchMoveHandler, {
      passive: false,
    });
    document.addEventListener("touchend", dragEndHandler);

    console.log(`Event listeners attached. isDragging: ${isDragging}`);

    // Cleanup function
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", dragEndHandler);
      document.removeEventListener("touchmove", touchMoveHandler);
      document.removeEventListener("touchend", dragEndHandler);
      console.log("Event listeners removed");
    };
  }, [isDragging]); // We only need to react when isDragging changes

  // Determine charging message based on charge level (memoized)
  const chargingMessage = useMemo(() => {
    if (charge >= 99) return "fully charged";
    if (charge >= 80) return "almost charged";
    if (charge >= 30) return "charging...";
    return "low battery";
  }, [charge]);

  return (
    <div className="battery-container">
      {/* Status message at top */}
      <div className="battery-status">
        <ChargingIcon />
        <small className="chargingMessage">{chargingMessage}</small>
      </div>

      {/* Percentage and time in middle */}
      <div className="data">
        <label htmlFor="battery" className="percentage">
          <motion.span
            animate={{ opacity: 1 }}
            initial={{ opacity: 0.8 }}
            key={charge}
            transition={{ type: "spring", damping: 100, stiffness: 100 }}
          >
            {charge}
          </motion.span>
          %
        </label>
        <span className="dot"></span>
        <span className="timeleft">{timeLeft}</span>
      </div>

      {/* Progress bar at bottom */}
      <div
        ref={containerRef}
        className="progress-container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={charge}
        tabIndex={0}
      >
        <motion.div
          className="progress-bar"
          animate={{
            width: `${charge}%`,
            boxShadow: [
              `0 0 10px 1px rgba(255, 255, 255, 0.7),
               0 0 15px 2px rgba(255, 255, 255, 0.5),
               0 0 20px 3px rgba(255, 255, 255, 0.3)`,
              `0 0 12px 2px rgba(255, 255, 255, 0.8),
               0 0 20px 5px rgba(255, 255, 255, 0.6),
               0 0 30px 7px rgba(255, 255, 255, 0.4)`,
              `0 0 10px 1px rgba(255, 255, 255, 0.7),
               0 0 15px 2px rgba(255, 255, 255, 0.5),
               0 0 20px 3px rgba(255, 255, 255, 0.3)`,
            ],
          }}
          transition={{
            width: {
              type: "spring",
              damping: 15,
              stiffness: 300,
              mass: 0.5,
            },
            boxShadow: {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            },
          }}
        />
      </div>
    </div>
  );
}
