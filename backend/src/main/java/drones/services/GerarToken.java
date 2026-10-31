package drones.services;

import java.util.Random;

public class GerarToken {
    public static String gerarToken() {
        Integer n1 = new Random().nextInt(10);
        Integer n2 = new Random().nextInt(10);
        Integer n3 = new Random().nextInt(10);
        Integer n4 = new Random().nextInt(10);
        Integer n5 = new Random().nextInt(10);
        Integer n6 = new Random().nextInt(10);
        return n1.toString() + n2.toString() + n3.toString()
         + n4.toString() + n5.toString() + n6.toString();
    }
}
