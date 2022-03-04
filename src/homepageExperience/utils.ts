import {
  AlertIcon,
  ClockIcon,
  ExecuteQueryIcon,
  FinishIcon,
  InitializeClientIcon,
  InstallDependenciesIcon,
  OverviewIcon,
  PythonIcon,
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
    name: '(Optional) \n Set up Alerts',
    icon: AlertIcon,
  },
  {
    name: 'Finish',
    icon: FinishIcon,
  },
]
