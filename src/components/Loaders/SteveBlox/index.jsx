import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import imgLogo from '../../../assets/company-logo/sanfernando.png';
import { useTheme } from '@mui/material';
import { SvgIconColors } from '../../../themes/palette';
const PageLoader = () => {
const theme = useTheme();
const color = SvgIconColors(theme.palette.appSettings)
    const loadTwo = keyframes`
    50% {
        transform: rotate(-90deg);
    }
    `;

    const rippleAnimation = keyframes`
        0% {
            transform: scale(0);
            opacity: 0.5;
        }
        50% {
            transform: scale(1);
            opacity: 0.7;
        }
        100% {
            transform: scale(2);
            opacity: 1;
        }
    `;
    

    const Loader = styled.div`
    width: 200px;
    height: 200px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    `;

    const LoaderCube = styled.div`
    position: absolute;
    width: 55%;
    height: 55%;
    border-radius: 10px;
    `;

    const GlowingCube = styled(LoaderCube)`
    z-index: 2;
    border: 2px solid ${color.svgcolor[100]};
    animation: ${loadTwo} 1.2s ease-out infinite;
    `;

    const ColorCube = styled(LoaderCube)`
    z-index: 1;
    filter: blur(4px);
    background: ${color.svgcolor[400]};
    animation: ${loadTwo} 0.9s ease-in-out infinite;
    `;
    

    const RippleImage = styled.img`
        position: absolute;
        width: 50px;
        height: 50px;
        object-fit: contain;
        z-index: 3;
        animation: ${rippleAnimation} 1.5s ease-out infinite;
    `;

  return (
    <Loader>
      <GlowingCube className="loader_cube loader_cube--glowing" />
      <ColorCube className="loader_cube loader_cube--color" />
      <RippleImage src={imgLogo} alt="Loading" />
    </Loader> 
  )
}

export default PageLoader