import {PageMetaStore, RouteType} from '#src/lib/router'
import {h} from 'preact'

import PaddedPage from './components/PaddedPage'
import Section from './components/Section'

export default function FillerEntryFactory({route}: {route: RouteType}) {
  const {slug} = route.vars!
  PageMetaStore.value = {title: slug}
  return (
    <PaddedPage>
      <Section header1={slug} backButton={route.hasBack}>
        <p>Nancy was a mighty fine person.</p>
      </Section>
      <Section>
        <p>
          1<br />
          <br />
          <br />
          <br />
          <br />2
          <br />
          <br />
          <br />
          <br />
          <br />3<br />
          <br />
          <br />
          <br />
          <br />4
        </p>
      </Section>
      <Section>
        <p>
          1<br />
          <br />
          <br />
          <br />
          <br />2
          <br />
          <br />
          <br />
          <br />
          <br />3<br />
          <br />
          <br />
          <br />
          <br />4
        </p>
      </Section>
      <Section>
        <p>
          1<br />
          <br />
          <br />
          <br />
          <br />2
          <br />
          <br />
          <br />
          <br />
          <br />3<br />
          <br />
          <br />
          <br />
          <br />4
        </p>
      </Section>
    </PaddedPage>
  )
}
