// Libraries
import React, {FC, useState, useEffect} from 'react'
import moment from 'moment'

// Components
import {
  Heading,
  HeadingElement,
  IconFont,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {AnnouncementBlock} from 'src/me/components/AnnouncementBlock'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/me/components/BlogFeed.scss'

// Expected structure of blog JSON data
interface Author {
  name: string
  url: string
  avatar?: string
}

interface BlogItem {
  url: string
  title: string
  content_text: string
  date_published: string
  date_modified: string
  authors?: Author[]
  author: Author
  tags: string[]
  attachments: {
    url: string
    mime_type: string
    title: string
    size_in_bytes: number
    duration_in_seconds: number
  }[]
}

interface BlogFeedData {
  version: string
  title: string
  home_page_url: string
  feed_url: string
  description: string
  items: BlogItem[]
  language: string
}

export const BlogFeed: FC = () => {
  const [jsonData, setJsonData] = useState<BlogFeedData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchData = () => {
      fetch('https://www.influxdata.com/blog/feed.json', {
        signal: abortController.signal,
        body: null,
        method: 'GET',
        mode: 'cors',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(
              `Network response was not ok: ${response.statusText}`
            )
          }
          return response.json()
        })
        .then((data: BlogFeedData) => {
          setJsonData(data)
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            return
          }
          setError(error.message)
          console.error('Error fetching JSON data:', error)
        })
    }

    fetchData()

    return () => {
      abortController.abort()
    }
  }, [])

  const handleMoreBlogsClick = () => {
    event('announcementBlock.moreBlogs.clicked')
  }

  if (error) {
    return null
  } else {
    return (
      <SpinnerContainer
        loading={jsonData ? RemoteDataState.Done : RemoteDataState.Loading}
        spinnerComponent={<TechnoSpinner />}
      >
        <Heading
          element={HeadingElement.H3}
          className="blog-feed--section-header"
        >
          Latest Blogs
        </Heading>
        {jsonData &&
          jsonData.items.slice(0, 2).map(item => (
            <AnnouncementBlock
              key={item.url}
              icon={IconFont.Text_New}
              date={moment(item.date_published).format(
                `MMM
              DD`
              )}
              body={
                <p>
                  {item.content_text}
                  {` `}
                  <SafeBlankLink href={item.url}>read more</SafeBlankLink>
                </p>
              }
              title={item.title}
              ctaLink={item.url}
            />
          ))}
        <div className="blog-feed--more-blogs">
          <SafeBlankLink
            href="https://www.influxdata.com/blog/"
            onClick={handleMoreBlogsClick}
          >
            <div className="cf-button cf-button-xs cf-button-tertiary">
              <span className="cf-button-label">more blogs</span>
            </div>
          </SafeBlankLink>
        </div>
      </SpinnerContainer>
    )
  }
}
