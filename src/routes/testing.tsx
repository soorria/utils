import { Component } from 'solid-js'
import CompressionFormatToggle from '~/components/sizes/CompressionFormatToggle'

export const route_Data = async () => {
  return {}
}

const Testing: Component = () => {
  // const data = useRouteData<typeof routeData>()
  return <CompressionFormatToggle formatName="a" id="a" name="a" />
  // return (
  //   <UtilLayout
  //     util={{
  //       description: 'a',
  //       path: 'a',
  //       slug: 'a',
  //       title: 'a',
  //     }}
  //   >
  //   </UtilLayout>
  // )
}

export default Testing
