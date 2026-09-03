export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
      <div className="grid lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-2">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">ABOUT</div>
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
            Young mind.<br /><span className="text-gold">Serious craft.</span>
          </h2>
        </div>
        <div className="lg:col-span-3 space-y-5 text-foreground/80 leading-relaxed text-lg">
          <p>
            I'm <span className="font-semibold text-foreground">Mohammed</span>, the mind behind PixelSpark — building websites,
            mobile apps and creative digital products for people and businesses who want to stand out online.
          </p>
          <p>
            I focus on quality, clean design and real results — not just pretty pages.
            Every project is built with strategy, speed and a clear obsession with how it
            actually performs for your business.
          </p>
          <p className="text-muted-foreground">
            I value communication, clarity and doing work that helps brands grow.
            If you're ready for digital that looks premium and works hard, you're in the right place.
          </p>
        </div>
      </div>
    </section>
  );
}
