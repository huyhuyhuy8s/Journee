import { Button } from "tamagui";
import { View } from "tamagui";

const Filter = ({ title }: { title: string }) => {
  return (
    <View>
      <Button>{title}</Button>
    </View>
  );
};

export default Filter;
