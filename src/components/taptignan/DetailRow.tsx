import { StyleSheet, Text, View } from 'react-native';

interface DetailRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  valueColor?: string;
  bold?: boolean;
  subtext?: string;
}

export function DetailRow({
  label,
  value,
  highlight = false,
  valueColor,
  bold = false,
  subtext,
}: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.value,
            highlight && styles.highlight,
            bold && styles.bold,
            valueColor ? { color: valueColor } : null,
          ]}
        >
          {value}
        </Text>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 13.5,
    color: '#64748b',
    flex: 1,
  },
  valueContainer: {
    alignItems: 'flex-end',
    flex: 1.5,
  },
  value: {
    fontSize: 14,
    color: '#0a1e4a',
    textAlign: 'right',
  },
  bold: {
    fontWeight: '700',
  },
  highlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0073f6',
  },
  subtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});
