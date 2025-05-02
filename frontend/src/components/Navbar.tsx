import { Bell, MenuIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   navigationMenuTriggerStyle,
// } from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const features = [
    {
      title: "Dashboard",
      description: "Overview of your activity",
      href: "#",
    },
    {
      title: "Analytics",
      description: "Track your performance",
      href: "#",
    },
    {
      title: "Settings",
      description: "Configure your preferences",
      href: "#",
    },
    {
      title: "Integrations",
      description: "Connect with other tools",
      href: "#",
    },
    {
      title: "Storage",
      description: "Manage your files",
      href: "#",
    },
    {
      title: "Support",
      description: "Get help when needed",
      href: "#",
    },
  ];

  return (
    <section className="py-4 border-b border-[#e94057] shadow-xl bg-zinc-950/90 backdrop-blur-sm fixed w-full top-0 z-50">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between">
          <p
            className="flex items-center gap-2 hover:opacity-75 transition-opacity"
          >
            <img
              src="https://www.mazda.co.th/_next/image?url=%2Fimages%2Fmazda-family%2Fbanner-overview-logo-m-2.png&w=3840&q=100"
              className="max-h-8 "
              alt="Shadcn UI Navbar"
            />
            <span className="text-lg text-white font-semibold">
              Ivory
            </span>
          </p>
          {/* <NavigationMenu className="hidden lg:block">
              <NavigationMenuList className="gap-1">

                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#"
                    className={`${navigationMenuTriggerStyle()} focus:bg-white text-zinc-200 hover:text-white hover:bg-zinc-800/50`}
                  >
                    Products
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#"
                    className={`${navigationMenuTriggerStyle()} focus:bg-white text-zinc-200 hover:text-white hover:bg-zinc-800/50`}
                  >
                    Resources
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#"
                    className={`${navigationMenuTriggerStyle()} focus:bg-white text-zinc-200 hover:text-white hover:bg-zinc-800/50`}
                  >
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu> */}
          <div className="hidden items-center gap-4 lg:flex">
            <Bell className="text-zinc-200 hover:text-[#e94057]" />
            <Button className="bg-white text-black hover:bg-[#e94057]">Connect Wallet</Button>
          </div>
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="border-zinc-700 hover:bg-zinc-800">
                <MenuIcon className="h-4 w-4 text-zinc-200" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto bg-zinc-950 border-zinc-800">
              <SheetHeader>
                <SheetTitle>
                  <a
                    href="https://www.shadcnblocks.com"
                    className="flex items-center gap-2"
                  >
                    <img
                      src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
                      className="max-h-8 invert"
                      alt="Shadcn UI Navbar"
                    />
                    <span className="text-lg font-semibold tracking-tighter text-zinc-100">
                      Shadcnblocks.com
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline text-zinc-200">
                      Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {features.map((feature, index) => (
                          <a
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-zinc-800"
                          >
                            <div key={feature.title}>
                              <p className="mb-1 font-semibold text-zinc-100">
                                {feature.title}
                              </p>
                              <p className="text-sm text-zinc-400">
                                {feature.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex flex-col gap-6">
                  <a href="#" className="font-medium text-zinc-200 hover:text-white">
                    Templates
                  </a>
                  <a href="#" className="font-medium text-zinc-200 hover:text-white">
                    Blog
                  </a>
                  <a href="#" className="font-medium text-zinc-200 hover:text-white">
                    Pricing
                  </a>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  <Button className="bg-white text-black hover:bg-zinc-200">Connect Wallet</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};

export { Navbar };