/** Who the kit is from: the portrait, the name and the role. The name follows, so the photo needs no alt text. */
export function Byline() {
  return (
    <div className="kit-byline">
      <img className="kit-byline-photo" src="/about/angad.jpg" width={44} height={44} alt="" />
      <div className="kit-byline-words">
        <p className="kit-byline-name">Angad Maniyambath</p>
        <p className="kit-byline-role">Head of AI at Truflation</p>
      </div>
    </div>
  )
}
