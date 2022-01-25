import math
import matplotlib.pyplot as plt

class OvenSimulation:
    def __init__(self):
        self.mass_air = 0.5
        self.specific_heat_air = 25
        self.mass_object = 1
        self.specific_heat_object = 400
        self.max_power_heater = 200
        self.heat_transfer_coefficient = 2
        self.thickness_wall = 0.05
        self.area_wall = 1
        self.temperature_outside = 20
        self.temperature_inside_begining = self.temperature_outside
        self.temperature_inside = [self.temperature_inside_begining]

        self.time_of_simulation = 10000
        self.sampling_period = 1
        self.target_temperature = 50
        self.temperature_difference = [self.target_temperature-self.temperature_inside[0]]
        self.temperature_difference_sum = self.temperature_difference[0]

        self.t = int(self.time_of_simulation/self.sampling_period)
        self.power_heater = 0
        self.e = [self.target_temperature-self.temperature_inside[0]]
        self.e_sum = self.e[0]
        self.kp = 0.0002
        self.Ti = 0.75
        self.Td = 0.25
        
    def simulation(self):
        for iter in range(1,self.t):
            self.temperature_inside.append(self.temperature_inside[-1]+(self.sampling_period/(self.mass_air*self.specific_heat_air+self.mass_object*self.specific_heat_object))*(self.power_heater-(self.heat_transfer_coefficient*self.area_wall*(self.temperature_inside[-1]-self.temperature_outside))))
            e = self.target_temperature-self.temperature_inside[iter]
            self.e.append(e)
            self.e_sum += e
            if iter>1:
                en = self.e[iter]
                den = self.e[-1]-self.e[-2]
                u = self.kp*(en+(self.sampling_period/self.Ti)*self.e_sum + (self.Td/self.sampling_period)*den)
                self.power_heater = self.max_power_heater*u
                if self.power_heater<0:
                    self.power_heater = 0


if __name__ == "__main__":
    sim = OvenSimulation()
    sim.simulation()
    plt.plot([i for i in range(sim.t)], sim.temperature_inside)
    plt.show()
