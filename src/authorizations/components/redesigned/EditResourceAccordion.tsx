// Libraries
import {Component} from 'react'

interface Props {
  permissions: any
}

export class ResourceAccordion extends Component<Props, {}> {
  public render() {
    // const {resources} = this.props // []
    const {permissions} = this.props
    /* {
      "telegrafs": {
      id: ""
      orgID:
      subLevelPermissions: {
        id: {
          id: ""
          permissions: {read: false, write: false}
        }
      }
      },
      annotations: {read: false, write: false}
    }
    */

    console.log(Object.keys(permissions))

    if (!permissions) {
      return null
    }
    // return resources.map(resource => {
    //   const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1)
    //   // console.log("resource", resource) resorce = buckets or telegrafs
    //   console.log(permissions[resource])
    //   return (
    //     <Accordion key={resource}>
    //       <ResourceAccordionHeader
    //         resourceName={resourceName} // Buckets
    //         permissions={permissions[resource]} // props.bucketPermissions
    //         onToggleAll={this.handleToggleAll}
    //       />
    //       {resourceName === 'Telegrafs' ||
    //         (resourceName === 'Buckets' && (
    //           <GetResources resources={[ResourceType[resourceName]]}>
    //             {!isEmpty(permissions[resource].sublevelPermissions) &&
    //               this.getAccordionBody(resourceName, resource)}
    //           </GetResources>
    //         ))}
    //     </Accordion>
    //   )
    // })
  }

  // getAccordionBody = (resourceName, resource) => {
  //   const {permissions} = this.props
  //   if (resourceName === 'Telegrafs') {
  //     return (
  //       <ResourceAccordionBody
  //         resourceName={resource}
  //         permissions={permissions[resource].sublevelPermissions}
  //         onToggle={this.handleIndividualToggle}
  //         title="Individual Telegraf Configuration Names"
  //       />
  //     )
  //   } else if (resourceName === 'Buckets') {
  //     return (
  //       <ResourceAccordionBody
  //         resourceName={resource}
  //         permissions={permissions[resource].sublevelPermissions}
  //         onToggle={this.handleIndividualToggle}
  //         title="Individual Bucket Names"
  //       />
  //     )
  //   }
  }
}
