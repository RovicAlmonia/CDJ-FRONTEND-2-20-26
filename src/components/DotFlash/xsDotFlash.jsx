import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const dotFlashing = keyframes`
  0% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
`;

export const DotFlashing = styled('div')`
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 2px;
  background-color: currentColor;
  border-radius: 50%;
  animation: ${dotFlashing} 1s infinite linear alternate;
  &:nth-of-type(1) {
    animation-delay: 0s;
  }
  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

const XSDotFlash = () => {
  return (
    <>
        <DotFlashing /><DotFlashing /><DotFlashing />
    </>
  )
}

export default XSDotFlash