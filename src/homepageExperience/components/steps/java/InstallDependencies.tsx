import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export const InstallDependencies: FC = () => {
  const logCopyCodeSnippet = () => {
    event('firstMile.javaWizard.InstallDependencies.code.copied')
  }

  const mavenDependency = `<dependency>
    <groupId>com.influxdb</groupId>
    <artifactId>influxdb-client-java</artifactId>
    <version>6.9.0</version>
</dependency>`
  const gradleDependency = `dependencies {
    implementation "com.influxdb:influxdb-client-java:6.9.0"
}`
  return (
    <>
      <h1>Install Dependencies</h1>
      <p>
        The first thing you'll need to do is ensure you have <code>Java 8</code>{' '}
        or higher. You can use any distribution of Java 8 or higher such as{' '}
        <SafeBlankLink href="https://jdk.java.net">OpenJDK</SafeBlankLink>,{' '}
        <SafeBlankLink href="https://adoptium.net/en-GB/temurin/">
          Eclipse Temurin
        </SafeBlankLink>
        ,{' '}
        <SafeBlankLink href="https://learn.microsoft.com/en-us/java/openjdk/download">
          Microsoft Build of OpenJDK
        </SafeBlankLink>
        , ...
      </p>
      <p>
        Install the JAR package{' '}
        <SafeBlankLink href="https://github.com/InfluxData/influxdb-client-java">
          influxdb-client-java
        </SafeBlankLink>{' '}
        to your project :
      </p>
      <h2>Maven dependency</h2>
      <CodeSnippet
        language="xml"
        onCopy={logCopyCodeSnippet}
        text={mavenDependency}
      />
      <p>
        You'll need to have{' '}
        <SafeBlankLink href="https://maven.apache.org/download.cgi">
          Maven 3.3.9
        </SafeBlankLink>{' '}
        or higher installed.
      </p>
      <h2>Or when using Gradle</h2>
      <CodeSnippet
        language="properties"
        onCopy={logCopyCodeSnippet}
        text={gradleDependency}
      />
      <p>
        You'll need to have{' '}
        <SafeBlankLink href="https://gradle.org/releases/">
          Gradle 7.4
        </SafeBlankLink>{' '}
        or higher installed.
      </p>
    </>
  )
}
