// Libraries
import React, {FC} from 'react'

// Components
import {
  AppWrapper,
  FunnelPage,
  Heading,
  HeadingElement,
  InfluxColors,
} from '@influxdata/clockface'
import {ProductComparisonTable} from 'src/products/ProductComparisonTable'

const ProductsPage: FC = () => (
  <AppWrapper type="funnel">
    <FunnelPage
      enableGraphic={true}
      backgroundColor={InfluxColors.Grey15}
      accentColorA={InfluxColors.Grey5}
      accentColorB={InfluxColors.Grey5}
    >
      <Heading element={HeadingElement.H1} className="products-page--title">
        Run InfluxDB 3.0 where you need it
      </Heading>
      <Heading element={HeadingElement.H2} className="products-page--sub-title">
        Select the deployment option that works for you
      </Heading>
      <ProductComparisonTable />
    </FunnelPage>
  </AppWrapper>
)

export default ProductsPage
