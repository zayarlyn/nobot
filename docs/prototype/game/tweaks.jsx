/* =========================================================================
   TWEAKS — minimal React mount for the glitch-intensity control.
   Drives --glitch CSS var, the scanline overlay, and window.GLITCH (engine).
   ========================================================================= */

const GAME_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "glitch": 6,
  "scanlines": true
}/*EDITMODE-END*/;

function GameTweaks() {
  const [t, setTweak] = useTweaks(GAME_TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--glitch", (t.glitch / 10).toFixed(2));
    window.GLITCH = t.glitch / 10;
  }, [t.glitch]);

  React.useEffect(() => {
    const el = document.getElementById("fxScan");
    if (el) el.style.display = t.scanlines ? "block" : "none";
  }, [t.scanlines]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Digital Decay" />
      <TweakSlider label="Glitch intensity" value={t.glitch} min={0} max={10} step={1}
        onChange={(v) => setTweak("glitch", v)} />
      <TweakToggle label="Scanline overlay" value={t.scanlines}
        onChange={(v) => setTweak("scanlines", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<GameTweaks />);
