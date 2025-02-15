import React, { useState } from 'react';
import { usePopper, Modifier } from 'react-popper';
import classnames from 'classnames';
import '@popperjs/core';

import { ignorePopperSize } from '@teambit/base-ui.utils.popper-js.ignore-popper-size';
import { resizeToMatchReference } from '@teambit/base-ui.utils.popper-js.resize-to-match-reference';

import { useAnimationFrame } from '../use-animation-frame';
import classStyles from './frame.module.scss';

const BASE_OFFSET = +classStyles.offset;

const popperModifiers: Modifier<any>[] = [
  ignorePopperSize,
  resizeToMatchReference,
  {
    name: 'flip',
    enabled: false,
  },
  {
    name: 'offset',
    options: {
      // move box from above the target ('top-start')
      // to directly cover the target.
      offset: ({ reference }: any) => [BASE_OFFSET, BASE_OFFSET - reference.height],
    },
  },
];

export interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  targetRef: HTMLElement | null;
  stylesClass?: string;
  /** continually update frame position to match moving elements */
  watchMotion?: boolean;
}

export function Frame({
  targetRef,
  watchMotion,
  className,
  stylesClass = classStyles.overlayBorder,
  style,
}: FrameProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes, update } = usePopper(targetRef, referenceElement, {
    modifiers: popperModifiers,
    placement: 'top-start',
  });

  useAnimationFrame(!!watchMotion && update);

  if (!targetRef) return null;

  return (
    <div
      ref={setReferenceElement}
      className={classnames(className, stylesClass)}
      style={{ ...styles.popper, ...style }}
      {...attributes.popper}
    />
  );
}
