import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export class InstallDependenciesSql extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.javaWizard.InstallDependencies.code.copied')
  }

  render() {
    const mavenDependency = `<dependency>
    <groupId>com.influxdb</groupId>
    <artifactId>influxdb3-java</artifactId>
    <version>1.0.0</version>
</dependency>`
    const gradleDependency = `dependencies {
    implementation "com.influxdb:influxdb3-java:1.0.0"
}`
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          Install the JAR package to your project{' '}
          <SafeBlankLink href="https://github.com/bonitoo-io/influxdb3-java">
            influxdb3-java
          </SafeBlankLink>{' '}
          :
        </p>
        <h2>Maven dependency</h2>
        <CodeSnippet
          language="xml"
          onCopy={this.logCopyCodeSnippet}
          text={mavenDependency}
        />
        <h2>Or when using Gradle</h2>
        <CodeSnippet
          language="properties"
          onCopy={this.logCopyCodeSnippet}
          text={gradleDependency}
        />
      </>
    )
  }
}
