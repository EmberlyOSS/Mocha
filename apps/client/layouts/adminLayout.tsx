import { classNames } from "@/shadcn/lib/utils";
import { SidebarProvider } from "@/shadcn/ui/sidebar";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  InboxStackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@radix-ui/themes";
import {
  ContactIcon,
  FileText,
  KeyRound,
  Mail,
  Mailbox,
  MoveLeft,
  RollerCoaster,
  UserRound,
  Webhook,
} from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { Fragment, useState } from "react";
import { AccountDropdown } from "../components/AccountDropdown";
import ThemeSettings from "../components/ThemeSettings";
import { useUser } from "../store/session";

export default function AdminLayout({ children }: any) {
  const { t, lang } = useTranslation("mocha");

  const { loading, user } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user && !user.isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">You are not an admin</h1>
      </div>
    );
  }

  const navigation = [
    {
      name: "Back",
      href: "/",
      current: null,
      icon: MoveLeft,
    },
    {
      name: t("sl_users"),
      href: "/admin/users/internal",
      current: location.pathname === "/admin/users/internal",
      icon: UserRound,
    },
    {
      name: t("sl_clients"),
      href: "/admin/clients",
      current: location.pathname === "/admin/clients",
      icon: ContactIcon,
    },
    {
      name: "Email Queues",
      href: "/admin/email-queues",
      current: location.pathname === "/admin/email-queues",
      icon: Mail,
    },
    {
      name: "Webhooks",
      href: "/admin/webhooks",
      current: location.pathname === "/admin/webhooks",
      icon: Webhook,
    },
    {
      name: "SMTP Email",
      href: "/admin/smtp",
      current: location.pathname === "/admin/smtp",
      icon: Mailbox,
    },
    {
      name: "Authentication",
      href: "/admin/authentication",
      current: location.pathname === "/admin/authentication",
      icon: KeyRound,
    },
    {
      name: "Roles",
      href: "/admin/roles",
      current: location.pathname === "/admin/roles",
      icon: RollerCoaster,
    },
    {
      name: "Logs",
      href: "/admin/logs",
      current: location.pathname === "/admin/logs",
      icon: FileText,
    },
  ];

  return (
    !loading &&
    user && (
      <SidebarProvider>
        <div className="w-full min-h-screen overflow-hidden bg-background">
          <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-50 lg:hidden"
              onClose={setSidebarOpen}
            >
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              </Transition.Child>

              <div className="fixed inset-0 flex">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="relative flex flex-1 w-full max-w-xs mr-16">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
                        <button
                          type="button"
                          className="-m-2.5 p-2.5"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="sr-only">Close sidebar</span>
                          <XMarkIcon
                            className="w-6 h-6 text-foreground"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </Transition.Child>
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-col px-6 pb-4 overflow-y-auto grow gap-y-5 bg-background">
                      <div className="flex align-middle flex-row h-14 items-center border-b-[1px]">
                        <img className="w-auto h-8" src="/logo.svg" alt="Workflow" />
                        <Link href="/">
                          <span className="ml-2 text-3xl font-bold hover:text-foreground ">
                            Mocha
                          </span>
                        </Link>
                      </div>
                      <nav className="flex flex-col flex-1">
                        <ul
                          role="list"
                          className="flex flex-col flex-1 gap-y-7"
                        >
                          <li>
                            <ul role="list" className="-mx-2 space-y-1">
                              {navigation.map((item: any) => (
                                <li key={item.name}>
                                  <Link
                                    href={item.href}
                                    className={classNames(
                                      item.current
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                      "group -mx-2 flex gap-x-3 p-1 rounded-md text-xs font-semibold leading-6"
                                    )}
                                  >
                                    <item.icon
                                      className="w-4 h-4 mt-1 ml-1 shrink-0"
                                      aria-hidden="true"
                                    />
                                    <span className="whitespace-nowrap">
                                      {item.name}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>

          {/* Static sidebar for desktop */}
          <div className="hidden border-r lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-64 2xl:w-72 lg:flex-col">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex flex-col pb-4 overflow-y-auto grow gap-y-5 bg-background">
              <div className="flex flex-row items-center px-6 align-middle border-b h-14">
                <img className="w-auto h-8" src="/logo.svg" alt="Workflow" />
                <Link href="/">
                  <span className="ml-2 text-3xl font-bold hover:text-foreground ">
                    Mocha
                  </span>
                </Link>
              </div>
              <nav className="flex flex-col flex-1 px-6">
                <ul role="list" className="flex flex-col flex-1 w-full gap-y-7">
                  <li>
                    <ul role="list" className="w-full -mx-2 space-y-1">
                      {navigation.map((item: any) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              "group -mx-2 flex gap-x-3 p-1 rounded-md text-xs font-semibold leading-6"
                            )}
                          >
                            <item.icon
                              className="w-4 h-4 mt-1 ml-1 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="whitespace-nowrap">
                              {item.name}
                            </span>
                            <div className="flex justify-end float-right w-full">
                              <span className="flex items-center justify-center w-6 h-6 font-medium bg-transparent border-none shrink-0 text-md">
                                {item.initial}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
                <ThemeSettings />
              </nav>
            </div>
          </div>

          <div className="lg:pl-64 2xl:pl-72">
            <div className="sticky top-0 z-10 flex items-center px-4 border-b h-14 shrink-0 gap-x-4 bg-background sm:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-foreground lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon
                  className="w-6 h-6 text-foreground"
                  aria-hidden="true"
                />
              </button>

              {/* Separator */}
              <div
                className="w-px h-6 bg-border lg:hidden"
                aria-hidden="true"
              />

              <div className="flex items-center self-stretch flex-1 gap-x-4 lg:gap-x-6">
                <div className="items-center justify-start hidden w-full space-x-6 sm:flex">
                  {user.isAdmin && (
                    <Link href="https://github.com/EmberlyOSS/Mocha/releases">
                      <span className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                        Version {process.env.NEXT_PUBLIC_CLIENT_VERSION}
                      </span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-end w-full gap-x-2 lg:gap-x-2 ">
                  <Button
                    variant="outline"
                    className="relative p-2 rounded-md text-muted-foreground hover:text-muted-foreground hover:cursor-pointer focus:outline-none"
                  >
                    <Link href="/notifications">
                      <InboxStackIcon className="w-4 h-4 text-foreground" />
                      {user.notifcations.filter(
                        (notification) => !notification.read
                      ).length > 0 && (
                        <svg
                          className="h-2.5 w-2.5 absolute bottom-6 left-6 animate-pulse fill-foreground"
                          viewBox="0 0 6 6"
                          aria-hidden="true"
                        >
                          <circle cx={3} cy={3} r={3} />
                        </svg>
                      )}
                    </Link>
                  </Button>

                  {user.isAdmin && (
                    <Link
                      href="https://github.com/EmberlyOSS/Mocha/discussions"
                      target="_blank"
                      className="hover:cursor-pointer"
                    >
                      <Button
                        variant="outline"
                        className="text-foreground hover:cursor-pointer whitespace-nowrap"
                      >
                        Send Feedback
                      </Button>
                    </Link>
                  )}

                  {/* Profile dropdown */}
                  <AccountDropdown />
                </div>
              </div>
            </div>

            {!loading && !user.external_user && (
              <main className="m-4 bg-background">{children}</main>
            )}
          </div>
        </div>
      </SidebarProvider>
    )
  );
}
