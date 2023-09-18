import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export const InstallDependenciesSql: FC = () => {
  const logCopyCodeSnippet = () => {
    event('firstMile.javaWizard.InstallDependencies.code.copied')
  }

  const mavenDependency = `<dependency>
    <groupId>com.influxdb</groupId>
    <artifactId>influxdb3-java</artifactId>
    <version>0.2.0</version>
</dependency>`
  const gradleDependency = `dependencies {
    implementation "com.influxdb:influxdb3-java:0.2.0"
}`
  return (
    <>
      <h1>Install Dependencies</h1>
      <p>
        The first thing you'll need to do is ensure you have{' '}
        <code>Java 11</code> or higher. You can use any distribution of Java 11
        or higher such as{' '}
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
        <SafeBlankLink href="https://github.com/InfluxCommunity/influxdb3-java">
          influxdb3-java
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
