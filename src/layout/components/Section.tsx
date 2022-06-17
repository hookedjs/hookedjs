import pstyled from '#src/lib/pstyled'
import {ComponentChildren, h} from 'preact'

import BackButton from './BackButton'

export default function Section(p: {
  header1?: ComponentChildren
  header2?: ComponentChildren
  fullHeight?: boolean
  backButton?: boolean
  children: ComponentChildren
}) {
  return (
    <SectionDiv data-fullHeight={p.fullHeight} data-backButton={p.backButton}>
      {!!p.header1 && (
        <div class="top">
          <h2 class="header1">
            {p.backButton && <BackButton />}
            {p.header1}
          </h2>
          {!!p.header2 && <h4 class="header2">{p.header2}</h4>}
        </div>
      )}
      <div class="bottom">{p.children}</div>
    </SectionDiv>
  )
}

const SectionDiv = pstyled.div`
	:root
		background: var(--white)
		margin-bottom: 10px
		border-radius: 8px
	:root[data-fullHeight="true"]
		min-height: var(--content-inner-height)
	:root:last-of-type
		margin-bottom: 0
	:root>.top
		padding: 6px 0 0 20px
		border-bottom: 1px solid var(--gray4)
	:root>.top>.header1
		margin-top: 1.6rem
	:root>.top>.header2
		margin-top: -.8rem
		font-size: 1rem
		color: var(--gray9)
	:root>.bottom
		padding: 20px 20px 30px
`
