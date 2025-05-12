void main() {
    // Shader compiler optimizations will remove unusued uniforms.
    // Since [LayerBuffer.computeLayer] needs to always set these uniforms, when 
    // this happens, an error occurs when calling setFloat()
    // `IndexError (RangeError (index): Index out of range: index should be less than 3: 3)`
    // With the following line, the compiler will not remove unused
    float tmp = (iFrame/iFrame) * (iMouse.x/iMouse.x) * 
        (iTime/iTime) * (iResolution.x/iResolution.x);
    if (tmp != 1.) tmp = 1.;

    // Get the original fragCoord
    vec2 fragCoord = FlutterFragCoord().xy;

    // Flip the y coordinate
    // fragCoord.y = iResolution.y - fragCoord.y;

    // Pass the flipped fragCoord to mainImage
    mainImage(fragColor, fragCoord * tmp);
}