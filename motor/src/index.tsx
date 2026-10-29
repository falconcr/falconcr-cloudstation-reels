import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Reel, totalFrames, ReelProps} from './Reel';
import {FPS, W, H} from './brand';

const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={totalFrames({})}
    defaultProps={{} as ReelProps}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames(props)})}
  />
);
registerRoot(Root);
