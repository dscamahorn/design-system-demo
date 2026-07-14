import { IconMoon, IconSun } from "icons";
import { Flex } from "layout";
import {
  Avatar,
  ButtonDanger,
  IconButton,
  SelectField,
  SelectItem,
} from "primitives";
import { Card } from "compositions";
import { useEffect, useState } from "react";
import "./sample-ui-theme.css";

export function SampleUI() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <Flex
      className="sample-ui-viewport"
      alignPrimary="center"
      alignSecondary="center"
      gap="600"
    >
      <IconButton
        className="sample-ui-theme-toggle"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        variant="neutral"
        onPress={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        {theme === "light" ? <IconMoon /> : <IconSun />}
      </IconButton>
      <Card variant="stroke" padding="600" direction="vertical">
        <Flex direction="column" gap="600" alignSecondary="stretch">
          <Avatar
            size="large"
            square
            src="https://i.pravatar.cc/80"
            alt="User avatar"
            style={{ width: "var(--avatar-diameter)", flexShrink: 0 }}
          />
          <Flex direction="column" gap="400" alignSecondary="stretch">
            <SelectField
              label="Label"
              description="Lorem ipsum dolar sit"
              aria-label="Label"
              defaultSelectedKey="value-test"
            >
              <SelectItem id="value-test">Value test</SelectItem>
              <SelectItem id="hello-world">Hello World</SelectItem>
              <SelectItem id="option-2">Option 2</SelectItem>
              <SelectItem id="option-3">Option 3</SelectItem>
              <SelectItem id="option-4">Option 4</SelectItem>
              <SelectItem id="option-5">Option 5</SelectItem>
            </SelectField>
            <ButtonDanger
              variant="danger-primary"
              onPress={() => console.log("Doug WAS here")}
            >
              Doug WAS here
            </ButtonDanger>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
