// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Icon, IconFont, TreeNav, PopoverPosition} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import OrgSettings from 'src/cloud/components/OrgSettings'

// Constants
import {generateNavItems} from 'src/pageLayout/constants/navigationHierarchy'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'
import {getOrg} from 'src/organizations/selectors'
import {AppSettingContext} from 'src/shared/contexts/app'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Types
import {NavItem, NavSubItem} from 'src/pageLayout/constants/navigationHierarchy'
import {AppState} from 'src/types'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import './TreeNav.scss'

type ReduxProps = ConnectedProps<typeof connector>

const TreeSidebar: FC<ReduxProps & RouteComponentProps> = () =>
  // {
  //   showOverlay,
  //   dismissOverlay,
  //   quartzMe,
  // }
  {
    const {presentationMode, navbarMode, setNavbarMode} = useContext(
      AppSettingContext
    )
    const org = useSelector(getOrg)

    useEffect(() => {
      if (isFlagEnabled('helpBar')) {
        const helpBarMenu = document.querySelectorAll<HTMLElement>(
          '.cf-tree-nav--sub-menu-trigger'
        )[3]
        if (!helpBarMenu) {
          return
        }
        if (navbarMode === 'expanded') {
          helpBarMenu.style.display = 'block'
          helpBarMenu.style.width = '243px'
        } else {
          helpBarMenu.style.width = '44px'
        }
      }
    }, [navbarMode])

    if (presentationMode || !org) {
      return null
    }

    const handleToggleNavExpansion = (): void => {
      if (navbarMode === 'expanded') {
        setNavbarMode('collapsed')
      } else {
        setNavbarMode('expanded')
      }
    }

    // Hiding Contact Support and Feedback code for Help Bar phase 1 release
    // https://github.com/influxdata/ui/issues/3457
    // https://github.com/influxdata/ui/issues/3454
    // const handleSelect = (): void => {
    //   const accountType = quartzMe?.accountType ?? 'free'
    //   const isPayGCustomer = accountType !== 'free'

    //   if (isPayGCustomer) {
    //     showOverlay('payg-support', null, dismissOverlay)
    //   } else {
    //     showOverlay('free-account-support', null, dismissOverlay)
    //   }
    // }

    // const openFeedbackOverlay = (): void => {
    //   showOverlay('feedback-questions', null, dismissOverlay)
    // }

    return (
      <OrgSettings>
        <TreeNav
          expanded={navbarMode === 'expanded'}
          headerElement={<NavHeader link={`/orgs/${org.id}`} />}
          userElement={<UserWidget />}
          onToggleClick={handleToggleNavExpansion}
        >
          {generateNavItems().map((item: NavItem) => {
            const linkElement = (className: string): JSX.Element => (
              <Link
                to={item.link}
                className={className}
                title={item.label}
                onClick={() => {
                  event('nav clicked', {which: item.id})
                }}
              />
            )
            return (
              <TreeNav.Item
                key={item.id}
                id={item.id}
                testID={item.testID}
                icon={<Icon glyph={item.icon} />}
                label={item.label}
                shortLabel={item.shortLabel}
                active={getNavItemActivation(
                  item.activeKeywords,
                  location.pathname
                )}
                linkElement={linkElement}
              >
                {Boolean(item.menu) && (
                  <TreeNav.SubMenu>
                    {item.menu.map((menuItem: NavSubItem) => {
                      const linkElement = (className: string): JSX.Element => (
                        <Link
                          to={menuItem.link}
                          className={className}
                          onClick={() => {
                            event('nav clicked', {
                              which: `${item.id} - ${menuItem.id}`,
                            })
                          }}
                        />
                      )

                      return (
                        <TreeNav.SubItem
                          key={menuItem.id}
                          id={menuItem.id}
                          testID={menuItem.testID}
                          active={getNavItemActivation(
                            [menuItem.id],
                            location.pathname
                          )}
                          label={menuItem.label}
                          linkElement={linkElement}
                        />
                      )
                    })}
                  </TreeNav.SubMenu>
                )}
              </TreeNav.Item>
            )
          })}
          {isFlagEnabled('helpBar') ? (
            <TreeNav.Item
              id="support"
              testID="nav-item-support"
              icon={<Icon glyph={IconFont.QuestionMark_New} />}
              label="Help & Support"
              shortLabel="Support"
              className="helpBarStyle" // margin-top is 365px or position: absolute bottom: 0
            >
              <TreeNav.SubMenu position={PopoverPosition.ToTheRight}>
                <TreeNav.SubHeading label="Support" />
                <TreeNav.SubItem
                  id="documentation"
                  label="Documentation"
                  testID="nav-subitem-documentation"
                  linkElement={() => (
                    <SafeBlankLink href="https://docs.influxdata.com/" />
                  )}
                />
                <TreeNav.SubItem
                  id="faqs"
                  label="FAQs"
                  testID="nav-subitem-faqs"
                  linkElement={() => (
                    <SafeBlankLink href="https://docs.influxdata.com/influxdb/v1.8/troubleshooting/frequently-asked-questions/" />
                  )}
                />
                {/* <TreeNav.SubItem
                id="contactSupport"
                label="Contact Support"
                testID="nav-subitem-contact-support"
                onClick={handleSelect}
              /> */}
                <TreeNav.SubHeading label="Community" />
                <TreeNav.SubItem
                  id="offcialForum"
                  label="Official Forum"
                  testID="nav-subitem-forum"
                  linkElement={() => (
                    <SafeBlankLink href="https://community.influxdata.com" />
                  )}
                />
                <TreeNav.SubItem
                  id="influxdbSlack"
                  label="InfluxDB Slack"
                  testID="nav-subitem-influxdb-slack"
                  linkElement={() => (
                    <SafeBlankLink href="https://influxcommunity.slack.com/join/shared_invite/zt-156zm7ult-LcIW2T4TwLYeS8rZbCP1mw#/shared-invite/email" />
                  )}
                />
                {/* <TreeNav.SubHeading label="Feedback" />
              <TreeNav.SubItem
                id="feedback"
                label="Feedback & Questions"
                testID="nav-subitem-feedback-questions"
                onClick={openFeedbackOverlay}
              /> */}
              </TreeNav.SubMenu>
            </TreeNav.Item>
          ) : null}
        </TreeNav>
      </OrgSettings>
    )
  }

const mstp = (state: AppState) => {
  return {quartzMe: state.me.quartzMe}
}

const mdtp = {
  showOverlay,
  dismissOverlay,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TreeSidebar))
