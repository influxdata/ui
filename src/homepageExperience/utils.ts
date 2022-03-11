import {
  ExecuteQueryIcon,
  FinishIcon,
  InitializeClientIcon,
  InstallDependenciesIcon,
  OverviewIcon,
  TokenIcon,
  WriteDataIcon,
} from 'src/homepageExperience/components/HomepageIcons'

export const HOMEPAGE_NAVIGATION_STEPS = [
  {
    name: 'Overview',
    icon: OverviewIcon,
  },
  {
    name: 'Install \n Dependencies',
    icon: InstallDependenciesIcon,
  },
  {
    name: 'Create a \n Token',
    icon: TokenIcon,
  },
  {
    name: 'Initialize \n Client',
    icon: InitializeClientIcon,
  },
  {
    name: 'Write \n Data',
    icon: WriteDataIcon,
  },
  {
    name: 'Execute a \n Simple Query',
    icon: ExecuteQueryIcon,
  },
  {
    name: 'Execute an \n Aggregate Query',
    icon: ExecuteQueryIcon,
  },
  {
    name: 'Finish',
    icon: FinishIcon,
  },
]
